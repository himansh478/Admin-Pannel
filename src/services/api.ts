/**
 * ============================================================
 * FILE: src/services/api.ts
 * PURPOSE: Centralized API Service Helper for Keshar Jewellers Admin Panel
 * ============================================================
 *
 * Automatically routes requests to Live Express Backend Server (https://my-jewellery-backend.onrender.com)
 * with seamless fallback.
 */

const DEFAULT_LOCAL_BACKEND = "http://localhost:5000";
const DEFAULT_RENDER_BACKEND = "https://my-jewellery-backend.onrender.com";

const CLOUDINARY_CLOUD_NAME = "dxq570mvr";
const CLOUDINARY_API_KEY = "188117449238834";
const CLOUDINARY_API_SECRET = "83e6_Oht4L0XWp_BEz3EuNkrEyY";

export function getBaseBackendUrl(): string {
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return DEFAULT_LOCAL_BACKEND;
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.trim().replace(/\/+$/, "");
  }
  return DEFAULT_LOCAL_BACKEND;
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

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data) {
        return data;
      }
      return { success: true };
    } else {
      console.warn(`Primary backend returned status ${res.status} for ${targetUrl}`);
    }
  } catch (err) {
    console.warn(`Primary backend request failed for ${targetUrl}:`, err);
  }

  // 2. Fallback Attempt (If primary URL was localhost, try Render; if primary was Render, try localhost)
  const fallbackUrl = getBackendURL(
    endpoint,
    targetUrl.includes("localhost") || targetUrl.includes("127.0.0.1")
      ? DEFAULT_RENDER_BACKEND
      : DEFAULT_LOCAL_BACKEND
  );

  try {
    const resFallback = await fetch(fallbackUrl, {
      ...options,
      headers,
    });

    if (resFallback.ok) {
      const dataFallback = await resFallback.json().catch(() => null);
      if (dataFallback) {
        return dataFallback;
      }
      return { success: true };
    }
    const errData = await resFallback.json().catch(() => null);
    return errData || { success: false, error: `Backend returned error ${resFallback.status}` };
  } catch (fallbackErr) {
    console.error(`Fallback backend request failed for ${fallbackUrl}:`, fallbackErr);
    return {
      success: false,
      error: "Backend connection failed. Please check that the backend server is running on http://localhost:5000.",
    };
  }
}

async function sha1Hex(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-1", enc.encode(str));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Robust image uploader: Direct Cloudinary CDN upload first, with multi-endpoint fallback
 */
export async function uploadFileToAPI(
  file: File,
  folder: string = "products"
): Promise<{ success: boolean; url?: string; error?: string }> {
  // 1. DIRECT CLOUDINARY UPLOAD (Instant, 100% reliable, zero server bottleneck)
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = await sha1Hex(toSign);

    const cFormData = new FormData();
    cFormData.append("file", file);
    cFormData.append("timestamp", String(timestamp));
    cFormData.append("folder", folder);
    cFormData.append("api_key", CLOUDINARY_API_KEY);
    cFormData.append("signature", signature);

    const cRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cFormData,
      }
    );

    if (cRes.ok) {
      const cData = await cRes.json();
      if (cData.secure_url) {
        return {
          success: true,
          url: cData.secure_url,
        };
      }
    }
  } catch (cErr) {
    console.warn("Direct Cloudinary upload failed, trying backend fallback...", cErr);
  }

  // 2. FALLBACK VIA BACKEND ENDPOINTS
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  let token = "";
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("keshar_admin_auth_session_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) token = parsed.token;
      }
    } catch (e) {}
  }

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const uploadEndpoints = [
    getBackendURL("/api/upload"),
    `${DEFAULT_RENDER_BACKEND}/api/upload`,
    `${DEFAULT_LOCAL_BACKEND}/api/upload`,
  ];

  for (const endpoint of uploadEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          return { success: true, url: data.url };
        }
      }
    } catch (err) {
      // Continue to next fallback
    }
  }

  return { success: false, error: "Image upload failed across all channels. Please check network connection." };
}

