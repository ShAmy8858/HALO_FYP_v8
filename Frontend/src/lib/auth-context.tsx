import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest, setAccessToken } from "@/lib/api";
import type { AuthUser, HospitalApplication, UserRole } from "@/types/api";

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  application: Pick<HospitalApplication, "id" | "applicationId" | "status" | "rejectionReason"> | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  application: AuthResponse["application"];
  initializing: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [application, setApplication] = useState<AuthResponse["application"]>(null);
  const [initializing, setInitializing] = useState(true);

  const applyAuth = (data: AuthResponse) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    setApplication(data.application);
  };

  const refreshSession = async () => {
    try {
      const data = await apiRequest<AuthResponse>("/auth/refresh", { method: "POST" });
      applyAuth(data);
    } catch {
      setAccessToken(null);
      setUser(null);
      setApplication(null);
    }
  };

  useEffect(() => {
    refreshSession().finally(() => setInitializing(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      application,
      initializing,
      login: async (role, email, password) => {
        const data = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ role, email, password }),
        });
        applyAuth(data);
        return data;
      },
      logout: async () => {
        try {
          await apiRequest("/auth/logout", { method: "POST" });
        } finally {
          setAccessToken(null);
          setUser(null);
          setApplication(null);
        }
      },
      refreshSession,
      setUser,
    }),
    [user, application, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, application, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/hospital"} replace />;
  }

  if (role === "MANAGER" && user.status !== "ACTIVE") {
    const query = application?.applicationId ? `?applicationId=${application.applicationId}` : "";
    return <Navigate to={`/application-status${query}`} replace />;
  }

  return <>{children}</>;
}
