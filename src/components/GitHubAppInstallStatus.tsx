import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/utils";
import { fetchBackend } from "@/lib/api";

interface GitHubAppInstallStatusProps {
  organizationId: string;
  onInstallationReady?: () => void;
}

interface GitHubStatus {
  is_linked: boolean;
  installation_ready: boolean;
  github_org_name?: string;
}

export default function GitHubAppInstallStatus({
  organizationId,
  onInstallationReady,
}: GitHubAppInstallStatusProps) {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetchBackend.get(
        `/organizations/${organizationId}/github-status`
      );

      if (response.ok) {
        const statusData = await response.json();
        setStatus(statusData);

        if (statusData.installation_ready && onInstallationReady) {
          onInstallationReady();
        }
      }
    } catch (error) {
      console.error("Error checking GitHub status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, onInstallationReady]);

  const startPolling = () => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      await checkStatus();

      if (status?.installation_ready) {
        clearInterval(interval);
        setIsPolling(false);
      }
    }, 1000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setIsPolling(false);
    }, 300000);
  };

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Checking GitHub status...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-sm text-gray-500">Unable to check GitHub status</div>
    );
  }

  if (!status.is_linked) {
    return (
      <div className="text-sm text-gray-500">
        GitHub organization not linked
      </div>
    );
  }

  if (status.installation_ready) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-600">
          GitHub App installed and ready
        </span>
      </div>
    );
  }

  // GitHub org is linked but app not installed
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm text-yellow-600">
          GitHub App installation required
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Install the CodePress GitHub App to enable repository access
      </div>

      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => {
            window.open(
              `https://github.com/apps/codepress-dev/installations/new`,
              "_blank"
            );
            startPolling();
          }}
          disabled={isPolling}
        >
          {isPolling ? "Waiting for installation..." : "Install GitHub App"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={checkStatus}
          disabled={isPolling}
        >
          Refresh Status
        </Button>
      </div>

      {isPolling && (
        <div className="text-xs text-blue-600">
          Waiting for installation... This may take a few moments.
        </div>
      )}
    </div>
  );
}
