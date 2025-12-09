import dynamic from "next/dynamic";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Editor: any = dynamic(
  () =>
    import("@quantfive/codepress-browser-extension").then(
      (mod) => mod.CodePressEditor
    ),
  { ssr: false }
);

const CODEPRESS_EDITOR_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.codepress.dev/v1"
    : "http://localhost:8007/v1";

export function CodePressEditor() {
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
