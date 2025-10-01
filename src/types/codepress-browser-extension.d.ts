declare module "@quantfive/codepress-browser-extension" {
  import { ComponentType } from "react";

  export interface CodePressEditorProps {
    tokenProvider?: () => Promise<string | null>;
    autoSaveToCurrentBranch?: boolean;
    useShadow?: boolean;
    apiBaseUrl?: string;
    protectedBranches?: string[];
  }

  export const CodePressEditor: ComponentType<CodePressEditorProps>;
}

declare module "@quantfive/codepress-browser-extension/style" {
  const styles: void;
  export default styles;
}
