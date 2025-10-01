import React, { useState, useEffect, useCallback } from "react";
import { Triangle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { fetchBackend } from "@/lib/api";

interface VercelInstallation {
  id: number;
  organization_id: number;
  organization_name: string;
  connected_by_user_id: string;
  connected_by_username: string;
  team_id?: string;
  team_name?: string;
  username_vercel: string;
  email_vercel: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VercelOrganizationStatus {
  organization_id: number;
  organization_name: string;
  is_connected: boolean;
  can_manage: boolean;
  installation?: VercelInstallation;
}

interface VercelStatus {
  user_organizations: VercelOrganizationStatus[];
}

interface ConnectVercelProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ConnectVercel: React.FC<ConnectVercelProps> = ({
  onSuccess,
  onError,
}) => {
  const { isLoggedIn, token } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [vercelStatus, setVercelStatus] = useState<VercelStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const checkVercelStatus = useCallback(async () => {
    if (!token) return;

    try {
      setStatusLoading(true);
      const response = await fetchBackend.get("/vercel/status");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const status: VercelStatus = await response.json();
      setVercelStatus(status);
    } catch (error) {
      console.error("Failed to check Vercel status:", error);
    } finally {
      setStatusLoading(false);
    }
  }, [token]);

  // Check Vercel connection status when component mounts or user changes
  useEffect(() => {
    if (isLoggedIn && token) {
      checkVercelStatus();
    }
  }, [isLoggedIn, token, checkVercelStatus]);

  const handleConnect = async (organization: VercelOrganizationStatus) => {
    if (!token) return;

    try {
      setAuthLoading(true);

      // Get the Vercel integration client slug from your backend
      const clientSlug = process.env.NEXT_PUBLIC_VERCEL_CLIENT_SLUG;
      if (!clientSlug) {
        throw new Error("Vercel client slug not configured");
      }

      // Generate secure state token from backend
      const response = await fetchBackend.post("/vercel/generate-state", {
        organization_id: organization.organization_id,
        redirect_url: null,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stateResponse: { state_token: string } = await response.json();

      if (!stateResponse.state_token) {
        throw new Error("Failed to generate secure state token");
      }

      // Use the secure signed state token from backend
      const secureStateToken = stateResponse.state_token;

      // Redirect user directly to Vercel integration page
      const vercelAuthUrl = `https://vercel.com/integrations/${clientSlug}/new?state=${secureStateToken}&orgId=${organization.organization_id}`;

      // Open in popup or redirect
      const popup = window.open(
        vercelAuthUrl,
        "vercel-oauth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      // Listen for popup to close or for callback
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          // Wait a moment for the backend to process, then check status
          setTimeout(async () => {
            await checkVercelStatus();
            // Check if the organization is now connected
            const updatedOrg = vercelStatus?.user_organizations.find(
              (org) => org.organization_id === organization.organization_id
            );
            if (updatedOrg?.is_connected) {
              onSuccess?.();
            }
          }, 1000);
        }
      }, 1000);

      // Clean up after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 5 * 60 * 1000);
    } catch (error: unknown) {
      console.error("Vercel connect error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      onError?.(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDisconnect = async (organization: VercelOrganizationStatus) => {
    if (!token) return;

    try {
      setAuthLoading(true);

      const response = await fetchBackend.post("/vercel/disconnect", {
        organization_id: organization.organization_id,
      });

      if (response.ok) {
        await checkVercelStatus();
        onSuccess?.();
      } else {
        throw new Error(`Failed to disconnect: ${response.statusText}`);
      }
    } catch (error: unknown) {
      console.error("Vercel disconnect error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Disconnect failed";
      onError?.(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-sm">Checking Vercel connection...</span>
      </div>
    );
  }

  if (!vercelStatus || vercelStatus.user_organizations.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-sm text-gray-600">
          No GitHub organizations found. Connect to GitHub first.
        </div>
      </div>
    );
  }

  // Show organizations and their Vercel connection status
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Vercel Integration
      </h3>
      <div className="space-y-2">
        {vercelStatus.user_organizations.map((org) => (
          <div
            key={org.organization_id}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    org.is_connected ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <Triangle
                    className={`w-4 h-4 ${
                      org.is_connected ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>
                <div>
                  <div className="text-base font-medium text-gray-900">
                    {org.organization_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {org.is_connected
                      ? org.installation
                        ? `Connected as ${
                            org.installation.team_name ||
                            org.installation.username_vercel
                          }`
                        : "Connected to Vercel"
                      : org.can_manage
                      ? "Click to connect Vercel"
                      : "No permission to manage Vercel"}
                  </div>
                </div>
              </div>
              <div>
                {org.is_connected
                  ? org.can_manage && (
                      <button
                        onClick={() => handleDisconnect(org)}
                        disabled={authLoading}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 border border-red-200 rounded-md hover:bg-red-50"
                      >
                        {authLoading ? "Disconnecting..." : "Disconnect"}
                      </button>
                    )
                  : org.can_manage && (
                      <button
                        onClick={() => handleConnect(org)}
                        disabled={authLoading}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 border border-blue-200 rounded-md hover:bg-blue-50"
                      >
                        {authLoading ? "Connecting..." : "Connect"}
                      </button>
                    )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectVercel;
