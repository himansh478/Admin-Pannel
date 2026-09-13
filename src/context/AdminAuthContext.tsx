/**
 * ============================================================
 * FILE: src/context/AdminAuthContext.tsx
 * PURPOSE: React Authentication Context for Keshar Jewellers Admin Panel
 * ============================================================
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchFromAPI } from "@/services/api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "superadmin" | "admin" | "manager";
  permissions?: string[];
  token?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerAdmin: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "superadmin" | "admin" | "manager";
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = "keshar_admin_auth_session_v1";

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore saved session on app mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setAdmin(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore admin auth session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin Login handler (Connects to Express Backend /api/admin/login)
  const login = async (email: string, password: string) => {
    try {
      const data = await fetchFromAPI("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data && data.success && data.admin) {
        setAdmin(data.admin);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.admin));
        return { success: true };
      }

      return { success: false, error: data?.error || "Login failed" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      return { success: false, error: msg };
    }
  };

  // Register New Admin handler (Connects to Express Backend /api/admin/create)
  const registerAdmin = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "superadmin" | "admin" | "manager";
  }) => {
    try {
      const result = await fetchFromAPI("/api/admin/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (result && result.success && result.admin) {
        return { success: true };
      }

      return { success: false, error: result?.error || "Failed to create admin" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = () => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoggedIn: !!admin,
        loading,
        login,
        registerAdmin,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
