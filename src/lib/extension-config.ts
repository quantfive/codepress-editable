/**
 * Chrome Extension Security Configuration
 *
 * This file contains security settings for communicating with the CodePress Chrome extension.
 * The extension ID should match your published extension's ID for security.
 */

import type { User } from "@/lib/auth/context";

// Hardcoded extension ID - replace with your actual extension ID
// You can find this by going to chrome://extensions/ in development mode
export const EXTENSION_CONFIG = {
  // Replace this with your actual CodePress Chrome Extension ID
  // During development: Go to chrome://extensions/, enable Developer mode, and copy the ID
  // For production: Use the ID from Chrome Web Store after publishing
  EXTENSION_ID:
    process.env.NEXT_PUBLIC_EXTENSION_ID || "hmhhoflnihobaldenandeddhmdenafjb",

  // Multiple supported extension IDs (tried in order)
  EXTENSION_IDS: [
    process.env.NEXT_PUBLIC_EXTENSION_ID,
    "dmjmpdhjbbggepdpbcjckohfkflckicn",
    "hmhhoflnihobaldenandeddhmdenafjb",
  ].filter(Boolean) as string[],

  // Allowed origins that can communicate with the extension
  ALLOWED_ORIGINS: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://codepress.dev",
    "https://editable.codepress.dev",
  ],

  // Message authentication key (shared secret)
  // In production, this should be environment-specific
  AUTH_KEY: "codepress-secure-messaging-v1",

  // Message timeout in milliseconds
  MESSAGE_TIMEOUT: 5000,
} as const;

/**
 * Types for extension messaging
 */
export interface BaseExtensionMessage {
  auth: string;
  timestamp: number;
  origin: string;
}

export interface PingMessage {
  type: "ping";
}

export interface SeedMessage {
  type: "seed";
  token: string;
}

export interface AuthUpdateMessage {
  type: "CODEPRESS_AUTH_UPDATE";
  payload: {
    token: string | null;
    user: User | null;
    isLoggedIn: boolean;
  };
}

type ExtensionMessage = PingMessage | SeedMessage | AuthUpdateMessage;

interface PingResponse {
  pong: boolean;
  extensionName: string;
}

interface SeedResponse {
  success: boolean;
  error?: string;
}

interface AuthUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type ExtensionResponse = PingResponse | SeedResponse | AuthUpdateResponse;

/**
 * Test if the extension is responding
 */
async function testExtensionConnection(extensionId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 3000);

    window.chrome.runtime.sendMessage(
      extensionId,
      {
        type: "ping",
        auth: EXTENSION_CONFIG.AUTH_KEY,
        timestamp: Date.now(),
        origin: window.location.origin,
      },
      (response) => {
        clearTimeout(timeout);

        if (window.chrome.runtime.lastError) {
          resolve(false);
          return;
        }

        resolve(
          response &&
            response.pong === true &&
            response.extensionName === "CodePress"
        );
      }
    );
  });
}

/**
 * Security utilities for Chrome extension messaging
 */
export class ExtensionSecurity {
  private static instance: ExtensionSecurity;
  private isInitialized = false;
  private isValidated = false;
  private validatedExtensionId: string | null = null;

  static getInstance(): ExtensionSecurity {
    if (!ExtensionSecurity.instance) {
      ExtensionSecurity.instance = new ExtensionSecurity();
    }
    return ExtensionSecurity.instance;
  }

  /**
   * Initialize the security context by verifying the extension
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isValidated;
    }

    try {
      // Enhanced Chrome extension API availability check
      const chrome = window.chrome;

      console.log("🔍 Extension API Debug:", {
        chromeExists: typeof chrome !== "undefined",
        runtimeExists: chrome && typeof chrome.runtime !== "undefined",
        runtimeId: chrome?.runtime?.id,
        url: window.location.href,
        origin: window.location.origin,
        userAgent: navigator.userAgent.includes("Chrome"),
        candidateExtensionIds: EXTENSION_CONFIG.EXTENSION_IDS,
      });

      if (typeof chrome === "undefined") {
        console.log(
          "❌ Chrome object not available - not running in Chrome or extension context missing"
        );
        this.isInitialized = true;
        this.isValidated = false;
        return false;
      }

      if (!chrome.runtime) {
        console.log(
          "❌ Chrome runtime not available - extension communication not possible"
        );
        this.isInitialized = true;
        this.isValidated = false;
        return false;
      }

      // Try candidate extension IDs in order
      const candidateIds = Array.from(new Set(EXTENSION_CONFIG.EXTENSION_IDS));
      for (const candidateId of candidateIds) {
        console.log(`🧪 Testing extension ID: ${candidateId}`);
        const isValid = await testExtensionConnection(candidateId);
        if (isValid) {
          this.isInitialized = true;
          this.isValidated = true;
          this.validatedExtensionId = candidateId;
          console.log(
            `✅ CodePress extension detected and verified: ${candidateId}`
          );
          return true;
        }
      }

      console.error(
        `❌ CodePress extension not responding. Tried IDs: ${candidateIds.join(
          ", "
        )}`
      );
      this.isInitialized = true;
      this.isValidated = false;
      return false;
    } catch (error) {
      console.error("❌ Failed to initialize extension security:", error);
      this.isInitialized = true;
      this.isValidated = false;
      return false;
    }
  }

  /**
   * Send a secure message to the verified CodePress extension
   */
  async sendSecureMessage(
    message: ExtensionMessage
  ): Promise<ExtensionResponse> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error("CodePress extension not available");
      }
    }

    if (!this.isValidated) {
      throw new Error("CodePress extension not validated");
    }

    // Create authenticated message
    const secureMessage = {
      ...message,
      auth: EXTENSION_CONFIG.AUTH_KEY,
      timestamp: Date.now(),
      origin: window.location.origin,
    };

    const orderedIds = this.validatedExtensionId
      ? [
          this.validatedExtensionId,
          ...EXTENSION_CONFIG.EXTENSION_IDS.filter(
            (id) => id !== this.validatedExtensionId
          ),
        ]
      : EXTENSION_CONFIG.EXTENSION_IDS;

    let lastError: unknown = null;
    for (const targetId of orderedIds) {
      try {
        const response = await new Promise<ExtensionResponse>(
          (resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Extension message timeout"));
            }, EXTENSION_CONFIG.MESSAGE_TIMEOUT);

            window.chrome.runtime.sendMessage(
              targetId,
              secureMessage,
              (response) => {
                clearTimeout(timeout);

                if (window.chrome.runtime.lastError) {
                  reject(new Error(window.chrome.runtime.lastError.message));
                  return;
                }

                resolve(response as ExtensionResponse);
              }
            );
          }
        );

        // Cache the working ID
        this.validatedExtensionId = targetId;
        return response;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to send message to any extension ID");
  }

  /**
   * Get the extension ID
   */
  getExtensionId(): string {
    return this.validatedExtensionId || EXTENSION_CONFIG.EXTENSION_ID;
  }

  /**
   * Check if the extension is available and verified
   */
  isAvailable(): boolean {
    return this.isInitialized && this.isValidated;
  }

  /**
   * Reset the extension security (force re-initialization)
   */
  reset(): void {
    this.isInitialized = false;
    this.isValidated = false;
    this.validatedExtensionId = null;
  }
}
