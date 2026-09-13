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
 * Unified fetch helper connecting directly to Express Backend Server (http://localhost:5000)
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

  try {
    const res = await fetch(targetUrl, {
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
    return { success: res.ok };
  } catch (err) {
    console.error(`Express Backend request failed for ${targetUrl}:`, err);
    return { success: false, error: "Backend server connection error. Make sure backend on port 5000 is running." };
  }
}
