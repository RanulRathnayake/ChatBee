"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { api } from "@/lib/apiClient";
import { clearToken, getToken, saveToken } from "@/lib/auth";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { disconnectSocket } from "@/lib/socket";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setToken(stored);
      
    }
    setInitializing(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });

    const accessToken = res.data.accessToken || res.data.access_token;
    const loggedUser = res.data.user as User | undefined;

    if (!accessToken) {
      throw new Error("Token not found in response");
    }

    saveToken(accessToken);
    setToken(accessToken);
    if (loggedUser) setUser(loggedUser);

    router.push("/chat");
  };

  const signup = async (email: string, username: string, password: string) => {
    await api.post("/auth/signup", { email, username, password });

    await login(username, password);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setToken(null);
    disconnectSocket();
    router.push("/login");
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
  };

  if (initializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <span className="animate-pulse text-lg">Loading...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
