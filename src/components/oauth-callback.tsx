import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { storeAndSyncAuthToken } from "@/lib/utils";
import { fetchBackend } from "@/lib/api";
import { useAuth } from "@/lib/auth/context";

interface OAuthCallbackProps {
  provider: "github" | "google" | "apple" | "vercel";
  providerDisplayName?: string;
}

export default function OAuthCallback({
  provider,
  providerDisplayName = provider,
}: OAuthCallbackProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { token, code, error, state } = router.query;

        if (error) {
          setStatus("error");
          setMessage(`${providerDisplayName} authentication failed: ${error}`);
          return;
        }

        // Prevent duplicate processing in StrictMode or re-renders
        const onceKey = `oauth_once:${provider}:${
          (code as string) || (token as string) || (state as string) || "_"
        }`;
        if (
          hasProcessedRef.current ||
          (typeof window !== "undefined" && sessionStorage.getItem(onceKey))
        ) {
          return;
        }
        hasProcessedRef.current = true;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(onceKey, "1");
        }

        // Handle direct token (for some OAuth flows)
        if (token && typeof token === "string") {
          // Store token and sync with Chrome extension
          await storeAndSyncAuthToken(token);
          // Immediately populate auth context user
          await login(token);

          setStatus("success");
          setMessage(
            `Successfully authenticated with ${providerDisplayName}! Redirecting...`
          );

          router.push("/dashboard");

          return;
        }

        // Handle OAuth code exchange (for Google, GitHub, etc.)
        if (code && typeof code === "string") {
          // Extract GitHub App installation parameters if present
          const { installation_id, setup_action } = router.query;

          const response = await fetchBackend.post(
            `/auth/${provider}/callback`,
            {
              code,
              state: state || null,
              installation_id: installation_id
                ? parseInt(installation_id as string)
                : undefined,
              setup_action: setup_action || undefined,
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.detail || `Backend authentication failed`
            );
          }

          const data = await response.json();

          if (data.access_token) {
            // Store token and sync with Chrome extension
            await storeAndSyncAuthToken(data.access_token);
            // Immediately populate auth context user
            await login(data.access_token);

            // Check if this is for organization linking
            const oauthAction = sessionStorage.getItem("github_oauth_action");
            const pendingOrgId = sessionStorage.getItem(
              "pending_github_link_org_id"
            );

            // We intentionally ignore backend-provided redirect paths.

            if (
              oauthAction === "link_organization" &&
              pendingOrgId &&
              provider === "github"
            ) {
              // Clean up session storage
              sessionStorage.removeItem("github_oauth_action");
              sessionStorage.removeItem("pending_github_link_org_id");
              sessionStorage.removeItem("github_oauth_success_redirect");

              setStatus("success");
              setMessage(
                `Successfully authenticated with ${providerDisplayName}! Redirecting...`
              );

              // Redirect to dashboard with query parameters to trigger GitHub org linking
              router.push(`/dashboard?link_github=true&org_id=${pendingOrgId}`);
              return;
            } else {
              setStatus("success");
              setMessage(
                `Successfully authenticated with ${providerDisplayName}! Redirecting...`
              );

              // Check for pending invitation before deciding where to redirect
              const pendingInvitationId = localStorage.getItem('pendingInvitationId');
              
              if (pendingInvitationId) {
                // User has a pending invitation, redirect back to accept it
                router.push(`/onboarding/accept-invitation?id=${pendingInvitationId}`);
                return;
              }

              const orgResponse = await fetchBackend.get("/organizations");

              if (orgResponse.ok) {
                const orgs = await orgResponse.json();
                if (orgs.length === 0) {
                  router.push("/onboarding");
                } else {
                  router.push("/dashboard");
                }
              } else {
                router.push("/onboarding"); // Default to onboarding if we can't check
              }
            }
          } else {
            throw new Error("No access token received from backend");
          }
          return;
        }

        // No token or code found
        setStatus("error");
        setMessage("No authentication token or code received");
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during authentication"
        );
        console.error(`${provider} OAuth error:`, err);
      }
    };

    // Only run when router is ready
    if (router.isReady) {
      handleCallback();
    }
    // We intentionally depend on specific router fields to avoid object identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    router.isReady,
    router.query.code,
    router.query.token,
    router.query.state,
    provider,
  ]);

  const getProviderIcon = () => {
    switch (provider) {
      case "github":
        return (
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case "google":
        return (
          <svg
            className="h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
        );
      case "apple":
        return (
          <svg
            className="h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
        );
      case "vercel":
        return (
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L24 22H0L12 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-lg mb-4">
            <div className="text-gray-600">{getProviderIcon()}</div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900">
            {status === "loading" &&
              `Authenticating with ${providerDisplayName}...`}
            {status === "success" && "Authentication Successful"}
            {status === "error" && "Authentication Failed"}
          </h2>

          {status === "loading" && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                Processing your {providerDisplayName} authentication...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="mt-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <div className="mt-4">
                <button
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
