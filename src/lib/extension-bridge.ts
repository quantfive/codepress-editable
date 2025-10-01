// Extension Bridge - Allows web app to communicate with Chrome extension

import { EXTENSION_CONFIG } from "./extension-config";

export interface AuthPayload {
  token: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  isLoggedIn: boolean;
}

export interface ExtensionMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

// Check if Chrome extension is available
export function isExtensionAvailable(): boolean {
  return !!(
    typeof window !== "undefined" &&
    window.chrome &&
    window.chrome.runtime &&
    window.chrome.runtime.sendMessage
  );
}

// Send auth update to Chrome extension
export async function sendAuthUpdateToExtension(
  authPayload: AuthPayload
): Promise<boolean> {
  if (!isExtensionAvailable()) {
    console.log("Chrome extension not available");
    return false;
  }

  try {
    // Try all known extension IDs in order
    for (const extensionId of EXTENSION_CONFIG.EXTENSION_IDS) {
      try {
        const response = await new Promise((resolve, reject) => {
          window.chrome.runtime.sendMessage(
            extensionId,
            {
              type: "CODEPRESS_AUTH_UPDATE",
              payload: authPayload,
            },
            (response: unknown) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            }
          );
        });

        console.log(
          `Successfully sent auth update to extension (${extensionId}):`,
          response
        );
        return true;
      } catch {
        // Try next ID
        continue;
      }
    }

    console.error("Failed to send auth update to any known extension ID");
    return false;
  } catch (error) {
    console.error("Failed to send auth update to extension:", error);
    return false;
  }
}

// Alternative method using postMessage for content script communication
export function sendAuthUpdateViaPostMessage(authPayload: AuthPayload): void {
  if (typeof window !== "undefined") {
    // Send message that content script can listen for
    window.postMessage(
      {
        type: "CODEPRESS_AUTH_UPDATE",
        payload: authPayload,
        source: "codepress-web-app",
      },
      "*"
    );
  }
}

// Open web app from extension
export async function openWebApp(): Promise<boolean> {
  if (!isExtensionAvailable()) {
    return false;
  }

  try {
    // Try all known extension IDs in order
    for (const extensionId of EXTENSION_CONFIG.EXTENSION_IDS) {
      try {
        await new Promise((resolve, reject) => {
          window.chrome.runtime.sendMessage(
            extensionId,
            {
              type: "OPEN_WEB_APP",
            },
            (response: unknown) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            }
          );
        });
        return true;
      } catch {
        // Try next ID
        continue;
      }
    }

    console.error("Failed to open web app via any known extension ID");
    return false;
  } catch (error) {
    console.error("Failed to open web app from extension:", error);
    return false;
  }
}
