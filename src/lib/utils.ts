import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ExtensionSecurity,
  type SeedMessage,
  type AuthUpdateMessage,
} from "./extension-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Auth token storage constants and utilities
const AUTH_TOKEN_KEY = "codepress.auth";
const USER_DATA_KEY = "github_user_data";

/**
 * Gets the authentication token from localStorage
 * @returns The stored auth token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Sets the authentication token in localStorage
 * @param token - The JWT token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Removes the authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Gets the user data from localStorage
 * @returns The stored user data or null if not found
 */
export function getUserData(): unknown | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Sets the user data in localStorage
 * @param userData - The user data to store
 */
export function setUserData(userData: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

/**
 * Removes the user data from localStorage
 */
export function removeUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Stores authentication token and syncs it with Chrome extension
 * @param token - The JWT token to store and sync
 * @param options - Additional options for storage behavior
 */
export async function storeAndSyncAuthToken(
  token: string,
  options: {
    /** Whether to show console logs for debugging */
    verbose?: boolean;
    /** Custom success callback */
    onSuccess?: () => void;
    /** Custom error callback */
    onError?: (error: unknown) => void;
  } = {}
): Promise<boolean> {
  const { verbose = true, onSuccess, onError } = options;

  try {
    // Store token in localStorage for web app
    setAuthToken(token);

    // Sync with Chrome extension using secure messaging
    try {
      const extensionSecurity = ExtensionSecurity.getInstance();

      // Check if extension is available and initialize security context
      const isAvailable = await extensionSecurity.initialize();
      if (!isAvailable) {
        if (verbose) {
          console.log(
            "CodePress Chrome extension not available - token stored locally only"
          );
        }
        return false;
      }

      // Send secure message to extension
      const seedMessage: SeedMessage = {
        type: "seed",
        token: token,
      };
      const response = await extensionSecurity.sendSecureMessage(seedMessage);

      // Type guard to check if response is SeedResponse
      const isSeedResponse = (
        resp: unknown
      ): resp is { success: boolean; error?: string } => {
        return typeof resp === "object" && resp !== null && "success" in resp;
      };

      if (isSeedResponse(response) && response.success) {
        if (verbose) {
          console.log(
            `Token synced securely with CodePress extension (${extensionSecurity.getExtensionId()})`
          );
        }
        onSuccess?.();
        return true;
      } else {
        const errorMsg =
          isSeedResponse(response) && response.error
            ? response.error
            : "Extension rejected token sync";
        throw new Error(errorMsg);
      }
    } catch (error) {
      if (verbose) {
        console.log("Failed to sync with CodePress extension:", error);
      }

      // Don't throw error if extension sync fails - the web app can still work
      onError?.(error);
      return false; // Extension sync failed, but localStorage succeeded
    }
  } catch (error) {
    if (verbose) {
      console.error("Failed to store authentication token:", error);
    }

    onError?.(error);
    throw error; // Re-throw since localStorage storage is critical
  }
}

/**
 * Clears authentication tokens from localStorage and Chrome extension
 */
export async function clearAuthTokens(
  options: { verbose?: boolean } = {}
): Promise<void> {
  const { verbose = true } = options;

  try {
    // Clear from localStorage
    removeAuthToken();

    // Clear from Chrome extension using secure messaging
    try {
      const extensionSecurity = ExtensionSecurity.getInstance();

      if (extensionSecurity.isAvailable()) {
        const authUpdateMessage: AuthUpdateMessage = {
          type: "CODEPRESS_AUTH_UPDATE",
          payload: {
            token: null,
            user: null,
            isLoggedIn: false,
          },
        };
        await extensionSecurity.sendSecureMessage(authUpdateMessage);

        if (verbose) {
          console.log(
            "Authentication cleared securely from CodePress extension"
          );
        }
      } else if (verbose) {
        console.log("CodePress extension not available for logout sync");
      }
    } catch (error) {
      if (verbose) {
        console.log("Failed to clear CodePress extension auth:", error);
      }
    }
  } catch (error) {
    if (verbose) {
      console.error("Failed to clear authentication tokens:", error);
    }
    throw error;
  }
}
