/**
 * ============================================================
 * FILE: src/services/api.ts
 * PURPOSE: Centralized API Service Helper for Keshar Jewellers Admin Panel
 * ============================================================
 *
 * Automatically routes requests to Express Backend Server (http://localhost:5000)
 * with seamless fallback to Next.js API endpoints.
 */

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function getBackendURL(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith("/api")) {
    return `${BACKEND_BASE_URL}${cleanEndpoint}`;
  }
  return `${BACKEND_BASE_URL}/api${cleanEndpoint}`;
}

/**
 * Unified fetch helper with automatic Express backend connection and fallback
 */
export async function fetchFromAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const primaryUrl = getBackendURL(endpoint);

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

  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => null);
    if (data) {
      return data;
    }
  } catch (err) {
    console.warn(`Express Backend request failed for ${primaryUrl}, trying local route fallback...`, err);
  }

  // Fallback to local Next.js API route (/api/...)
  const fallbackUrl = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const resFallback = await fetch(fallbackUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  return await resFallback.json();
}
