import { CodePressEditor as Editor } from "@quantfive/codepress-browser-extension";
import { useEffect, useState } from "react";

const CODEPRESS_EDITOR_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.codepress.dev/v1"
    : "http://localhost:8007/v1";

export function CodePressEditor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "codepress-editing-mode",
          JSON.stringify(Boolean(true))
        );
      } catch {
        // Ignore storage failures (e.g., SSR, private mode)
      }
    }
  }, []);

  // Don't render on server-side
  if (!mounted) {
    return null;
  }

  const tokenProvider = async () => {
    // You can add authentication token logic here if needed
    return null;
  };

  return (
    <Editor
      tokenProvider={tokenProvider}
      useShadow={true}
      apiBaseUrl={CODEPRESS_EDITOR_API_BASE_URL}
      protectedBranches={["main"]}
    />
  );
}
