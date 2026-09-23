/**
 * ============================================================
 * FILE: src/services/api.ts
 * PURPOSE: Centralized API Service Helper for Keshar Jewellers Admin Panel
 * ============================================================
 *
 * Automatically routes requests to Live Express Backend Server (https://my-jewellery-backend.onrender.com)
 * with seamless fallback.
 */

const API_URL = "https://jewellery-gfwd.onrender.com";

export function getBaseBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.trim().replace(/\/+$/, "");
  }
  return API_URL;
}

export function getBackendURL(endpoint: string, base: string = getBaseBackendUrl()): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const cleanBase = base.replace(/\/+$/, "");
  if (cleanEndpoint.startsWith("/api")) {
    return `${cleanBase}${cleanEndpoint}`;
  }
  return `${cleanBase}/api${cleanEndpoint}`;
}

/**
 * Unified fetch helper connecting directly to Express Backend Server
 */
export async function fetchFromAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const targetUrl = getBackendURL(endpoint);

  let token = "";
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("keshar_admin_auth_session_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) token = parsed.token;
      }
    } catch (e) {
      // Ignore token extraction error
    }
  }

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...authHeaders,
    ...(options.headers || {}),
  };

  // 1. Primary Attempt
  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);
    if (data) {
      return data;
    }
    return { success: res.ok };
  } catch (err) {
    console.warn(`Primary backend request failed for ${targetUrl}:`, err);
  }

  // 2. Fallback Attempt (If primary request failed or timed out, retry)
  try {
    await new Promise((r) => setTimeout(r, 1000));
    const resFallback = await fetch(targetUrl, {
      ...options,
      headers,
    });

    const dataFallback = await resFallback.json().catch(() => null);
    if (dataFallback) {
      return dataFallback;
    }
    return { success: resFallback.ok };
  } catch (fallbackErr) {
    console.error(`Fallback backend request failed for ${targetUrl}:`, fallbackErr);
    return {
      success: false,
      error: "Backend connection failed. Please check your network or try again in a few seconds.",
    };
  }
}
