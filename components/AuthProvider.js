"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("authUser");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("authUser");
      localStorage.removeItem("accessToken");
    } finally {
      setReady(true);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    setSession(data) {
      localStorage.setItem("accessToken", data.accessToken || data.token || "");
      localStorage.setItem("authUser", JSON.stringify(data));
      setUser(data);
    },
    logout() {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      setUser(null);
      router.push("/login");
    },
  }), [user, ready, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}