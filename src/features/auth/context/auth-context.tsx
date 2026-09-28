"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiClient, setAccessToken, onAuthFailure } from "@/lib/api-client";
import type { User, AuthResponse } from "../types";
import type { LoginInput, RegisterInput } from "../schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.post<any>(
        "/auth/refresh",
        {},
        { skipAuth: true }
      );
      const token = response?.data?.accessToken || response?.accessToken;
      if (token) {
        setAccessToken(token);
        let userData = response?.data?.user || response?.user;
        if (!userData) {
          const meRes = await apiClient.get<any>("/auth/me");
          userData = meRes?.data?.user || meRes?.data || meRes;
        }
        setUser(userData);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribe = onAuthFailure(() => {
      setUser(null);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [refresh]);

  const login = async (credentials: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<any>(
      "/auth/login",
      credentials,
      { skipAuth: true }
    );
    const token = response?.data?.accessToken || response?.accessToken;
    let userData = response?.data?.user || response?.user;
    if (token) {
      setAccessToken(token);
      if (!userData) {
        const meRes = await apiClient.get<any>("/auth/me");
        userData = meRes?.data?.user || meRes?.data || meRes;
      }
      setUser(userData);
    }
    return response;
  };

  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<any>(
      "/auth/register",
      data,
      { skipAuth: true }
    );
    const token = response?.data?.accessToken || response?.accessToken;
    let userData = response?.data?.user || response?.user;
    if (token) {
      setAccessToken(token);
      if (!userData) {
        const meRes = await apiClient.get<any>("/auth/me");
        userData = meRes?.data?.user || meRes?.data || meRes;
      }
      setUser(userData);
    }
    return response;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
    } finally {
      setAccessToken(null);
      setUser(null);
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
