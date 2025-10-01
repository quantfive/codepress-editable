import React, { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { initiateGitHubOAuth } from "@/lib/github-oauth";
import { Button } from "./ui/button";

interface GitHubLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  action?: "login" | "link_organization";
  organizationId?: string;
  buttonText?: string;
  buttonClassName?: string;
  variant?: "default" | "compact";
  successRedirectPath?: string;
}

const GitHubLogin: React.FC<GitHubLoginProps> = ({
  // onSuccess,
  onError,
  action = "login",
  organizationId,
  buttonText,
  buttonClassName,
  variant = "default",
  successRedirectPath,
}) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Use the utility function for OAuth
      initiateGitHubOAuth({
        action,
        organizationId,
        successRedirectPath,
        redirectUri:
          action === "login"
            ? `${window.location.origin}/auth/callback`
            : `${window.location.origin}/auth/github/callback`,
      });
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "OAuth failed";
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     setLoading(true);
  //     await logout();
  //     onSuccess?.();
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Logout failed";
  //     onError?.(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (isLoggedIn && user) {
  //   return (
  //     <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
  //       <Image
  //         src={user.avatar_url}
  //         alt={user.name}
  //         width={40}
  //         height={40}
  //         className="w-10 h-10 rounded-full"
  //       />
  //       <div className="flex-1">
  //         <div className="font-medium text-green-900">{user.name}</div>
  //         <div className="text-sm text-green-700">@{user.login}</div>
  //       </div>
  //       <button
  //         onClick={handleLogout}
  //         disabled={loading}
  //         className="px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
  //       >
  //         {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Logout"}
  //       </button>
  //     </div>
  //   );
  // }

  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (action === "link_organization") return "Connect GitHub";
    return "Connect with GitHub";
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      size="default"
      className={buttonClassName}
    >
      {loading ? (
        variant === "compact" ? (
          <>
            <div className="w-3 h-3 mr-1 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <Loader2 className="w-5 h-5 animate-spin" />
        )
      ) : variant === "compact" ? (
        getButtonText()
      ) : (
        <>
          <Github className="w-5 h-5" />
          <span>{getButtonText()}</span>
        </>
      )}
    </Button>
  );
};

export default GitHubLogin;
