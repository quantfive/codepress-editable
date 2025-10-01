"use client";

import { CodePressEditor as Editor } from "@quantfive/codepress-browser-extension";
import "@quantfive/codepress-browser-extension/style";
import { useEffect, useState } from "react";

export function CodePressEditor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      autoSaveToCurrentBranch
      useShadow={true}
      protectedBranches={["main"]}
    />
  );
}
