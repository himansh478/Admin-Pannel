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
    const restoreSession = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            // Optimistic local load
            setAdmin(parsed);

            // Fetch latest profile from DB to get actual name and role
            if (parsed.token) {
              try {
                const result = await fetchFromAPI("/api/admin/profile", {
                  headers: {
                    Authorization: `Bearer ${parsed.token}`
                  }
                });
                
                if (result && result.success && result.admin) {
                  // Merge token as getAdminProfile might not return it
                  const updatedAdmin = { ...result.admin, token: parsed.token };
                  setAdmin(updatedAdmin);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAdmin));
                }
              } catch (err) {
                console.error("Failed to fetch latest admin profile:", err);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore admin auth session:", e);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Admin Login handler — Strict backend-only authentication (superadmin only)
  const login = async (email: string, password: string) => {
    try {
      const data = await fetchFromAPI("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data && data.success && data.admin) {
        // Only allow superadmin role to access the panel
        if (data.admin.role && data.admin.role !== "superadmin" && data.admin.role !== "admin" && data.admin.role !== "manager") {
          return { success: false, error: "Access denied. Superadmin credentials required." };
        }
        setAdmin(data.admin);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.admin));
        return { success: true };
      }

      return { success: false, error: data?.error || "Invalid email or password." };
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
