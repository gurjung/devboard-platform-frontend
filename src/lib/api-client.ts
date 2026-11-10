import { chaosController } from "@/features/simulation/chaos-controller";
import { handleDemoRequest, isDemoMode } from "@/features/simulation/mock-demo-data";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const TOKEN_STORAGE_KEY = "devboard_access_token";
const DEMO_REFRESHED_TOKEN = "demo-mock-jwt-token-refreshed";

let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let authFailureSubscribers: Array<() => void> = [];

export const getAccessToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        inMemoryAccessToken = stored;
        return stored;
      }
    } catch {}
  }
  return null;
};

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {}
  }
};

export const onAuthFailure = (callback: () => void) => {
  authFailureSubscribers.push(callback);
  return () => {
    authFailureSubscribers = authFailureSubscribers.filter((cb) => cb !== callback);
  };
};

const notifyAuthFailure = () => {
  if (isDemoMode()) return;
  setAccessToken(null);
  authFailureSubscribers.forEach((cb) => cb());
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://devboard-platform-backend.onrender.com";

export async function refreshAuthToken(): Promise<string | null> {
  if (isDemoMode()) {
    setAccessToken(DEMO_REFRESHED_TOKEN);
    return DEMO_REFRESHED_TOKEN;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (isDemoMode()) {
        setAccessToken(DEMO_REFRESHED_TOKEN);
        return DEMO_REFRESHED_TOKEN;
      }

      if (!refreshResponse.ok) {
        throw new Error("Session expired. Please log in again.");
      }

      const refreshData = await refreshResponse.json();
      const newAccessToken =
        refreshData?.data?.accessToken || refreshData?.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh.");
      }

      if (isDemoMode()) {
        setAccessToken(DEMO_REFRESHED_TOKEN);
        return DEMO_REFRESHED_TOKEN;
      }

      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (refreshErr) {
      if (isDemoMode()) {
        setAccessToken(DEMO_REFRESHED_TOKEN);
        return DEMO_REFRESHED_TOKEN;
      }
      notifyAuthFailure();
      throw refreshErr;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, params, ...customConfig } = options;

  let endpointWithParams = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      endpointWithParams += (endpointWithParams.includes("?") ? "&" : "?") + queryString;
    }
  }

  const url = endpointWithParams.startsWith("http")
    ? endpointWithParams
    : `${API_BASE_URL}${endpointWithParams.startsWith("/") ? "" : "/"}${endpointWithParams}`;

  const headers: Record<string, string> = {
    ...(customConfig.headers as Record<string, string>),
  };

  if (!(customConfig.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const currentToken = getAccessToken();
  if (!skipAuth && currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  const method = (customConfig.method || "GET").toUpperCase();

  // Chaos & Simulation Interceptor
  const chaosInterception = await chaosController.interceptRequest(endpointWithParams, method);
  if (chaosInterception?.errorToThrow) {
    const { status, message, data } = chaosInterception.errorToThrow;

    // If 401 was injected, test resilience of the silent token refresh queue
    if (
      status === 401 &&
      !skipAuth &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/register") &&
      !endpoint.includes("/auth/refresh")
    ) {
      try {
        const newToken = await refreshAuthToken();
        if (!newToken) {
          throw new ApiError(401, "Session expired. Please log in again.");
        }
        const demoRetry = handleDemoRequest<T>(
          endpointWithParams,
          method,
          customConfig.body
        );
        if (demoRetry.handled) {
          return demoRetry.data as T;
        }
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryRes = await fetch(url, {
          ...customConfig,
          headers: retryHeaders,
          credentials: "include",
        });
        return parseResponse<T>(retryRes);
      } catch (err: unknown) {
        const errMessage =
          err instanceof Error ? err.message : "Session expired. Please log in again.";
        throw new ApiError(401, errMessage);
      }
    }

    throw new ApiError(status, message, data);
  }

  // Instant Demo Mode Interceptor
  const demoRes = handleDemoRequest<T>(
    endpointWithParams,
    method,
    customConfig.body
  );
  if (demoRes.handled) {
    return demoRes.data as T;
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: "include",
  };

  const execute = async (): Promise<Response> => {
    return fetch(url, config);
  };

  let response: Response;
  try {
    response = await execute();
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error
        ? error.message
        : "Network error. Please check your connection.";
    throw new ApiError(0, errMessage);
  }

  if (
    response.status === 401 &&
    !skipAuth &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register") &&
    !endpoint.includes("/auth/refresh")
  ) {
    try {
      const newToken = await refreshAuthToken();
      if (!newToken) {
        throw new ApiError(401, "Session expired. Please log in again.");
      }

      const demoRetry = handleDemoRequest<T>(
        endpointWithParams,
        method,
        customConfig.body
      );
      if (demoRetry.handled) {
        return demoRetry.data as T;
      }

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(url, {
        ...config,
        headers: retryHeaders,
      });
      return parseResponse<T>(retryRes);
    } catch (err: unknown) {
      const errMessage =
        err instanceof Error ? err.message : "Session expired. Please log in again.";
      throw new ApiError(401, errMessage);
    }
  }

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null
        ? data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        : data || `HTTP ${response.status}: ${response.statusText}`;

    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },

  upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },

  healthCheck(): Promise<{ status: string; uptime: number; timestamp: string }> {
    return request<{ status: string; uptime: number; timestamp: string }>("/health", {
      skipAuth: true,
      method: "GET",
    });
  },
};
