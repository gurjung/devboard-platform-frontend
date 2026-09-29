export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const TOKEN_STORAGE_KEY = "devboard_access_token";

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let refreshSubscribers: Array<(token: string) => void> = [];
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
  setAccessToken(null);
  authFailureSubscribers.forEach((cb) => cb());
};

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onTokenRefreshFailed = (error: any) => {
  refreshSubscribers = [];
  notifyAuthFailure();
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://devboard-platform-backend.onrender.com";

export async function refreshAuthToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        throw new Error("Session expired. Please log in again.");
      }

      const refreshData = await refreshResponse.json();
      const newAccessToken =
        refreshData?.data?.accessToken || refreshData?.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh.");
      }

      setAccessToken(newAccessToken);
      isRefreshing = false;
      onTokenRefreshed(newAccessToken);
      return newAccessToken;
    } catch (refreshErr) {
      isRefreshing = false;
      onTokenRefreshFailed(refreshErr);
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

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

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
  } catch (error: any) {
    throw new ApiError(0, error.message || "Network error. Please check your connection.");
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

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(url, {
        ...config,
        headers: retryHeaders,
      });
      return parseResponse<T>(retryRes);
    } catch (err: any) {
      throw new ApiError(401, err.message || "Session expired. Please log in again.");
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

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
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
