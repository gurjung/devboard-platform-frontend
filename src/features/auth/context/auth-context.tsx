"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  apiClient,
  setAccessToken,
  getAccessToken,
  refreshAuthToken,
  onAuthFailure,
} from "@/lib/api-client";
import {
  DEMO_USER,
  isDemoMode,
  setDemoMode,
  subscribeDemoMode,
} from "@/features/simulation/mock-demo-data";
import type { User, AuthResponse } from "../types";
import type { LoginInput, RegisterInput } from "../schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  loginAsDemoUser: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface AuthApiEnvelope {
  data?: {
    accessToken?: string;
    user?: User;
  } & Partial<User>;
  accessToken?: string;
  user?: User;
}

function isUserLike(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<User>;
  return Boolean(candidate.id || candidate.email);
}

function extractUserFromResponse(payload: unknown): User | null {
  if (!payload || typeof payload !== "object") return null;
  const envelope = payload as AuthApiEnvelope;
  const candidates: unknown[] = [
    envelope.data?.user,
    envelope.data,
    envelope.user,
    payload,
  ];
  for (const candidate of candidates) {
    if (isUserLike(candidate)) {
      return candidate;
    }
  }
  return null;
}

function extractTokenFromResponse(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const envelope = payload as AuthApiEnvelope;
  return envelope.data?.accessToken || envelope.accessToken;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authEpochRef = useRef(0);

  const refresh = useCallback(async () => {
    const epoch = authEpochRef.current;
    try {
      await Promise.resolve();
      if (authEpochRef.current !== epoch) return;

      if (isDemoMode()) {
        if (!getAccessToken()) {
          setAccessToken("demo-mock-jwt-token");
        }
        setUser(DEMO_USER);
        setIsLoading(false);
        return;
      }

      const existingToken = getAccessToken();
      if (existingToken) {
        try {
          const meRes = await apiClient.get<unknown>("/auth/me");
          if (authEpochRef.current !== epoch || isDemoMode()) return;
          const userData = extractUserFromResponse(meRes);
          if (userData) {
            setUser(userData);
            setIsLoading(false);
            return;
          }
        } catch {
          if (authEpochRef.current !== epoch || isDemoMode()) return;
          // Token expired or invalid, fall through to refresh
        }
      }

      // Try refreshing session
      const newToken = await refreshAuthToken();
      if (authEpochRef.current !== epoch || isDemoMode()) return;

      if (newToken) {
        const meRes = await apiClient.get<unknown>("/auth/me");
        if (authEpochRef.current !== epoch || isDemoMode()) return;
        const userData = extractUserFromResponse(meRes);
        setUser(userData);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } catch {
      if (authEpochRef.current !== epoch || isDemoMode()) return;
      setAccessToken(null);
      setUser(null);
    } finally {
      if (authEpochRef.current === epoch || isDemoMode()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        return refresh();
      }
      return undefined;
    });

    const unsubscribeAuth = onAuthFailure(() => {
      if (isDemoMode()) return;
      authEpochRef.current += 1;
      setUser(null);
      setIsLoading(false);
    });

    const unsubscribeDemo = subscribeDemoMode(() => {
      authEpochRef.current += 1;
      if (isDemoMode()) {
        if (!getAccessToken()) {
          setAccessToken("demo-mock-jwt-token");
        }
        setUser(DEMO_USER);
        setIsLoading(false);
      } else {
        setUser((prev) => (prev?.id === DEMO_USER.id ? null : prev));
      }
    });

    return () => {
      active = false;
      unsubscribeAuth();
      unsubscribeDemo();
    };
  }, [refresh]);

  const login = async (credentials: LoginInput): Promise<AuthResponse> => {
    const epoch = ++authEpochRef.current;
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
      { skipAuth: true }
    );
    const token = extractTokenFromResponse(response);
    let userData = extractUserFromResponse(response);
    if (token && authEpochRef.current === epoch) {
      setDemoMode(false);
      setAccessToken(token);
      if (!userData) {
        const meRes = await apiClient.get<unknown>("/auth/me");
        userData = extractUserFromResponse(meRes);
      }
      if (authEpochRef.current === epoch) {
        setUser(userData);
        setIsLoading(false);
      }
    }
    return response;
  };

  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    const epoch = ++authEpochRef.current;
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      data,
      { skipAuth: true }
    );
    const token = extractTokenFromResponse(response);
    let userData = extractUserFromResponse(response);
    if (token && authEpochRef.current === epoch) {
      setDemoMode(false);
      setAccessToken(token);
      if (!userData) {
        const meRes = await apiClient.get<unknown>("/auth/me");
        userData = extractUserFromResponse(meRes);
      }
      if (authEpochRef.current === epoch) {
        setUser(userData);
        setIsLoading(false);
      }
    }
    return response;
  };

  const loginAsDemoUser = async () => {
    authEpochRef.current += 1;
    setDemoMode(true);
    setAccessToken("demo-mock-jwt-token");
    setUser(DEMO_USER);
    setIsLoading(false);
  };

  const logout = async () => {
    authEpochRef.current += 1;
    const wasDemo = isDemoMode();
    try {
      if (!wasDemo) {
        await apiClient.post("/auth/logout");
      }
    } catch {
    } finally {
      setDemoMode(false);
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginAsDemoUser,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
