// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8007/v1";

// GitHub OAuth Configuration
export const GITHUB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Iv23liPtsCOHyl6mrulZ";
export const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";

// Import token utilities
import { getAuthToken } from "./utils";
import { v4 as uuidv4 } from "uuid";

// Token refresh handler
function handleTokenRefresh(response: Response) {
  const newToken = response.headers.get("X-New-Token");
  if (newToken) {
    localStorage.setItem("auth_token", newToken);
    console.log("🔄 JWT refreshed automatically");
  }
}

// Create request config with auth headers
export function createAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// Build headers for requests
function buildHeaders(
  options: {
    includeAuth?: boolean;
    contentType?: string | null;
    additionalHeaders?: Record<string, string>;
  } = {}
): Record<string, string> {
  // Get token from localStorage
  const token = getAuthToken();

  const {
    includeAuth = !!token, // Default to true if token exists, false otherwise
    contentType = "application/json",
    additionalHeaders = {},
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (includeAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return { ...headers, ...additionalHeaders };
}

/**
 * Create a config object for GET requests
 */
export function GET_CONFIG(
  options: {
    includeAuth?: boolean;
    additionalHeaders?: Record<string, string>;
  } = {}
): RequestInit {
  const { includeAuth, additionalHeaders } = options;

  return {
    method: "GET",
    headers: buildHeaders({
      includeAuth,
      additionalHeaders,
    }),
  };
}

/**
 * Create a config object for POST requests
 */
export function POST_CONFIG(
  options: {
    data?: unknown;
    includeAuth?: boolean;
    contentType?: string | null;
    additionalHeaders?: Record<string, string>;
  } = {}
): RequestInit {
  const { data, includeAuth, contentType, additionalHeaders } = options;

  return {
    method: "POST",
    headers: buildHeaders({
      includeAuth,
      contentType,
      additionalHeaders,
    }),
    body: data ? JSON.stringify(data) : undefined,
  };
}

/**
 * Create a config object for PUT requests
 */
export function PUT_CONFIG(
  options: {
    data?: unknown;
    includeAuth?: boolean;
    contentType?: string | null;
    additionalHeaders?: Record<string, string>;
  } = {}
): RequestInit {
  const { data, includeAuth, contentType, additionalHeaders } = options;

  return {
    method: "PUT",
    headers: buildHeaders({
      includeAuth,
      contentType,
      additionalHeaders,
    }),
    body: data ? JSON.stringify(data) : undefined,
  };
}

/**
 * Create a config object for PATCH requests
 */
export function PATCH_CONFIG(
  options: {
    data?: unknown;
    includeAuth?: boolean;
    contentType?: string | null;
    additionalHeaders?: Record<string, string>;
  } = {}
): RequestInit {
  const { data, includeAuth, contentType, additionalHeaders } = options;

  return {
    method: "PATCH",
    headers: buildHeaders({
      includeAuth,
      contentType,
      additionalHeaders,
    }),
    body: data ? JSON.stringify(data) : undefined,
  };
}

/**
 * Create a config object for DELETE requests
 */
export function DELETE_CONFIG(
  options: {
    includeAuth?: boolean;
    additionalHeaders?: Record<string, string>;
  } = {}
): RequestInit {
  const { includeAuth, additionalHeaders } = options;

  return {
    method: "DELETE",
    headers: buildHeaders({
      includeAuth,
      additionalHeaders,
    }),
  };
}

// Logout functionality
export async function logout() {
  if (!getAuthToken()) {
    // Already logged out
    return;
  }

  try {
    const response = await fetchBackend.post("/auth/logout");

    // Always clear local token, even if server request fails
    localStorage.removeItem("auth_token");

    if (response.ok) {
      console.log("✅ Successfully logged out");
    } else {
      console.warn("⚠️ Logout request failed, but local token cleared");
    }
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Still clear local token
    localStorage.removeItem("auth_token");
  }
}

// Logout from all devices
export async function logoutAll() {
  if (!getAuthToken()) {
    return;
  }

  try {
    const response = await fetchBackend.post("/auth/logout-all");

    // Always clear local token
    localStorage.removeItem("auth_token");

    if (response.ok) {
      console.log("✅ Successfully logged out from all devices");
    } else {
      console.warn(
        "⚠️ Logout all devices request failed, but local token cleared"
      );
    }
  } catch (error) {
    console.error("❌ Logout all devices error:", error);
    localStorage.removeItem("auth_token");
  }
}

// Interface for fetchBackend options
interface FetchBackendOptions {
  includeAuth?: boolean;
  additionalHeaders?: Record<string, string>;
  skipAuth?: boolean;
}

// Interface for request data
interface RequestData {
  [key: string]: unknown;
}

/**
 * Core fetchBackend function that handles all API requests
 * - Automatically adds API base URL for relative URLs
 * - Automatically adds auth headers for API calls
 * - Handles token refresh
 */
async function fetchBackendCore(
  url: string,
  init: RequestInit = {},
  options: FetchBackendOptions = {}
): Promise<Response> {
  const {
    includeAuth = true,
    additionalHeaders = {},
    skipAuth = false,
  } = options;

  console.log("fetchBackendCore", url, init, options);

  // Build full URL
  let fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  console.log("fullUrl", fullUrl);

  // Remove trailing slash if present (checking before query params and fragments)
  const queryIndex = fullUrl.indexOf("?");
  const fragmentIndex = fullUrl.indexOf("#");
  const earliestIndex =
    queryIndex === -1
      ? fragmentIndex
      : fragmentIndex === -1
      ? queryIndex
      : Math.min(queryIndex, fragmentIndex);

  if (earliestIndex === -1) {
    // No query params or fragments, just check if it ends with slash
    if (fullUrl.endsWith("/")) {
      fullUrl = fullUrl.slice(0, -1);
    }
  } else {
    // Has query params or fragments, check if there's a slash before them
    const pathPart = fullUrl.substring(0, earliestIndex);
    if (pathPart.endsWith("/")) {
      fullUrl = pathPart.slice(0, -1) + fullUrl.substring(earliestIndex);
    }
  }

  // Get token
  const token = getAuthToken();

  // Build headers
  const headers = new Headers(init.headers);

  // Add default headers if not present
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Add Content-Type for requests with body (if not already set and body exists)
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth header if token exists and auth is not disabled
  if (includeAuth && !skipAuth && token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Add additional headers
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const enhancedInit: RequestInit = {
    ...init,
    headers,
  };

  console.log("full url again", fullUrl);

  const response = await fetch(fullUrl, enhancedInit);

  // Handle token refresh
  handleTokenRefresh(response);

  return response;
}

/**
 * fetchBackend API - A clean alternative to monkey-patched fetch
 * Provides convenient methods for common HTTP operations
 */
export const fetchBackend = {
  /**
   * GET request
   */
  async get(url: string, options: FetchBackendOptions = {}): Promise<Response> {
    return fetchBackendCore(url, { method: "GET" }, options);
  },

  /**
   * POST request with optional data
   */
  async post(
    url: string,
    data?: RequestData,
    options: FetchBackendOptions = {}
  ): Promise<Response> {
    const init: RequestInit = {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    };
    return fetchBackendCore(url, init, options);
  },

  /**
   * PUT request with optional data
   */
  async put(
    url: string,
    data?: RequestData,
    options: FetchBackendOptions = {}
  ): Promise<Response> {
    const init: RequestInit = {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    };
    return fetchBackendCore(url, init, options);
  },

  /**
   * PATCH request with optional data
   */
  async patch(
    url: string,
    data?: RequestData,
    options: FetchBackendOptions = {}
  ): Promise<Response> {
    const init: RequestInit = {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    };
    return fetchBackendCore(url, init, options);
  },

  /**
   * DELETE request
   */
  async delete(
    url: string,
    options: FetchBackendOptions = {}
  ): Promise<Response> {
    return fetchBackendCore(url, { method: "DELETE" }, options);
  },

  /**
   * Custom request with full control over RequestInit
   */
  async request(
    url: string,
    init: RequestInit,
    options: FetchBackendOptions = {}
  ): Promise<Response> {
    return fetchBackendCore(url, init, options);
  },
};

// Generate or retrieve a stable client_id for waitlist deduplication
function getOrCreateWaitlistClientId(): string {
  // Guard for SSR
  if (typeof window === "undefined") {
    return "unknown";
  }
  let id: string | null = localStorage.getItem("waitlist_client_id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("waitlist_client_id", id);
  }
  return id;
}

/**
 * Helper to make a fetch call that explicitly skips auth
 * Even if it's an API call, no auth headers will be added
 */
export function fetchWithoutAuth(
  url: string,
  init?: RequestInit
): Promise<Response> {
  return fetchBackendCore(url, init || {}, { skipAuth: true });
}

// Waitlist API
export async function submitWaitlist(
  email: string,
  source?: string
): Promise<{ ok: boolean; message: string }> {
  const clientId = getOrCreateWaitlistClientId();
  const response = await fetchBackend.post(
    "/waitlist",
    { email, source, client_id: clientId },
    { includeAuth: false }
  );
  try {
    const data = await response.json();
    return {
      ok: response.ok,
      message: data?.message ?? (response.ok ? "Success" : "Failed"),
    };
  } catch {
    return { ok: response.ok, message: response.ok ? "Success" : "Failed" };
  }
}
