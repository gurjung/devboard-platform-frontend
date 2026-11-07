import type { ChaosConfig, SimulationLog, LogLevel } from "./types";

export const DEFAULT_CHAOS_CONFIG: ChaosConfig = {
  enabled: false,
  latencyMs: 0,
  forceOffline: false,
  nextErrorStatus: null,
  nextErrorMessage: null,
  errorRate: 0,
  targetEndpoints: [],
  rateLimitRetryAfterSec: 3,
};

type ConfigListener = (config: ChaosConfig) => void;
type LogListener = (log: SimulationLog) => void;

class ChaosController {
  private config: ChaosConfig = { ...DEFAULT_CHAOS_CONFIG };
  private configListeners = new Set<ConfigListener>();
  private logListeners = new Set<LogListener>();
  private logs: SimulationLog[] = [];

  public getConfig(): ChaosConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<ChaosConfig>): ChaosConfig {
    this.config = { ...this.config, ...partial };
    this.notifyConfig();
    return this.getConfig();
  }

  public resetConfig(): void {
    this.config = { ...DEFAULT_CHAOS_CONFIG };
    this.notifyConfig();
  }

  public subscribeConfig(listener: ConfigListener): () => void {
    this.configListeners.add(listener);
    listener(this.getConfig());
    return () => {
      this.configListeners.delete(listener);
    };
  }

  public subscribeLogs(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  public getLogs(): SimulationLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public log(
    level: LogLevel,
    title: string,
    description?: string,
    meta?: Record<string, unknown>
  ): SimulationLog {
    const entry: SimulationLog = {
      id: `sim_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      level,
      title,
      description,
      meta,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    this.logListeners.forEach((fn) => {
      try {
        fn(entry);
      } catch (err) {
        console.error("Error in simulation log listener:", err);
      }
    });
    return entry;
  }

  private notifyConfig(): void {
    const current = this.getConfig();
    this.configListeners.forEach((fn) => {
      try {
        fn(current);
      } catch (err) {
        console.error("Error in simulation config listener:", err);
      }
    });
  }

  /**
   * Called by api-client.ts to evaluate chaos rules before making a network request
   */
  public async interceptRequest(
    endpoint: string,
    method = "GET"
  ): Promise<{ errorToThrow?: { status: number; message: string; data?: unknown } } | void> {
    if (!this.config.enabled) {
      return;
    }

    // Check if target endpoints are configured
    if (this.config.targetEndpoints && this.config.targetEndpoints.length > 0) {
      const isTargeted = this.config.targetEndpoints.some((target) =>
        endpoint.includes(target)
      );
      if (!isTargeted) {
        return;
      }
    }

    // 1. Injected Latency Simulation
    if (this.config.latencyMs > 0) {
      this.log(
        "network",
        `Latency Delay: ${this.config.latencyMs}ms injected`,
        `${method} ${endpoint}`,
        { latencyMs: this.config.latencyMs }
      );
      await new Promise((resolve) => setTimeout(resolve, this.config.latencyMs));
    }

    // 2. Offline Simulation
    if (this.config.forceOffline) {
      this.log(
        "fault",
        "Offline Failure Injected",
        `Simulated Network Disconnect on ${method} ${endpoint}`
      );
      return {
        errorToThrow: {
          status: 0,
          message: "Network error: Connection refused (Simulated Offline Mode)",
        },
      };
    }

    // 3. Explicit Single-Shot Error Status (e.g. 500, 429, 401, 403)
    if (this.config.nextErrorStatus) {
      const status = this.config.nextErrorStatus;
      const customMessage = this.config.nextErrorMessage;

      // Consume single-shot error
      this.config.nextErrorStatus = null;
      this.config.nextErrorMessage = null;
      this.notifyConfig();

      const defaultMessages: Record<number, string> = {
        400: "Bad Request (Simulated Client Error)",
        401: "Unauthorized: Access token has expired or is invalid (Simulated)",
        403: "Forbidden: You do not have permission for this resource (Simulated RBAC Failure)",
        404: "Not Found: The requested entity was not found (Simulated)",
        429: "Too Many Requests: Rate limit exceeded. Please back off. (Simulated)",
        500: "Internal Server Error: Database transaction failed (Simulated Chaos)",
        503: "Service Unavailable: Upstream service overloaded (Simulated)",
      };

      const message = customMessage || defaultMessages[status] || `HTTP ${status} Simulated Error`;

      this.log(
        "fault",
        `HTTP ${status} Injected`,
        `${method} ${endpoint} failed with ${status}: ${message}`,
        { status, message, endpoint }
      );

      const errorPayload: Record<string, unknown> = {
        status,
        message,
        simulated: true,
      };

      if (status === 429) {
        errorPayload.retryAfter = this.config.rateLimitRetryAfterSec || 3;
      }

      return {
        errorToThrow: {
          status,
          message,
          data: errorPayload,
        },
      };
    }

    // 4. Probabilistic Error Rate (e.g. 20% random drop)
    if (this.config.errorRate > 0 && Math.random() < this.config.errorRate) {
      const status = 500;
      const message = "Simulated Probabilistic Server Failure (500)";

      this.log(
        "fault",
        "Probabilistic 500 Error Injected",
        `Random chaos triggered failure on ${method} ${endpoint}`,
        { errorRate: this.config.errorRate }
      );

      return {
        errorToThrow: {
          status,
          message,
          data: { simulated: true },
        },
      };
    }
  }
}

export const chaosController = new ChaosController();
