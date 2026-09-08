"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserLoginPayload, UserRegisterPayload } from "./types";
import { ApiService } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: UserLoginPayload) => Promise<void>;
  register: (payload: UserRegisterPayload) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "agentsight_auth_token";
const USER_STORAGE_KEY = "agentsight_user_cache";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            // ignore JSON parse error
          }
        }

        if (savedToken) {
          setToken(savedToken);
          try {
            const freshUser = await ApiService.getMe(savedToken);
            setUser(freshUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
          } catch (err) {
            console.warn("Session expired or invalid token:", err);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (payload: UserLoginPayload) => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(payload);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: UserRegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await ApiService.register(payload);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.demoLogin();
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
