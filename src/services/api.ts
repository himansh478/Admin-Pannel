/**
 * ============================================================
 * FILE: src/services/api.ts
 * PURPOSE: Centralized API Service Helper for Keshar Jewellers Admin Panel
 * ============================================================
 *
 * Automatically routes requests to Live Express Backend Server (https://my-jewellery-backend.onrender.com)
 */

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://my-jewellery-backend.onrender.com";

export function getBackendURL(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith("/api")) {
    return `${BACKEND_BASE_URL}${cleanEndpoint}`;
  }
  return `${BACKEND_BASE_URL}/api${cleanEndpoint}`;
}

/**
 * Unified fetch helper connecting directly to Live Express Backend Server
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
    console.warn(`Initial request failed for ${targetUrl}, retrying after 2s for Render cold-start...`, err);
    // Automatic retry for Render cold start
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const resRetry = await fetch(targetUrl, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
          ...(options.headers || {}),
        },
      });
      const dataRetry = await resRetry.json().catch(() => null);
      if (dataRetry) return dataRetry;
      return { success: resRetry.ok };
    } catch (retryErr) {
      console.error(`Retry failed for ${targetUrl}:`, retryErr);
      return {
        success: false,
        error: "Backend connection failed. Render backend might be starting up, please try again in a few seconds.",
      };
    }
  }
}
