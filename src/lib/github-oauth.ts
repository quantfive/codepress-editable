import { GITHUB_CLIENT_ID, GITHUB_OAUTH_URL } from "@/lib/api";

export interface GitHubOAuthOptions {
  action?: "login" | "link_organization";
  organizationId?: string;
  redirectUri?: string;
  scope?: string;
  successRedirectPath?: string;
}

export const initiateGitHubOAuth = (options: GitHubOAuthOptions = {}) => {
  const {
    action = "login",
    organizationId,
    redirectUri = `${window.location.origin}/auth/github/callback`,
    scope = "read:user user:email read:org",
    successRedirectPath,
  } = options;

  // Generate state parameter for security
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Store state in sessionStorage for verification
  sessionStorage.setItem("github_oauth_state", state);
  sessionStorage.setItem("github_oauth_action", action);

  // Store organization ID if linking
  if (action === "link_organization" && organizationId) {
    sessionStorage.setItem("pending_github_link_org_id", organizationId);
  }

  // Store success redirect path if provided
  if (successRedirectPath) {
    sessionStorage.setItem(
      "github_oauth_success_redirect",
      successRedirectPath
    );
  }

  // Build OAuth URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope,
    state,
  });

  const authUrl = `${GITHUB_OAUTH_URL}?${params.toString()}`;

  // Redirect to GitHub OAuth
  window.location.href = authUrl;
};

export const clearGitHubOAuthState = () => {
  sessionStorage.removeItem("github_oauth_state");
  sessionStorage.removeItem("github_oauth_action");
  sessionStorage.removeItem("pending_github_link_org_id");
  sessionStorage.removeItem("github_oauth_success_redirect");
};
