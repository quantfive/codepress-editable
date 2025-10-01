import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/api";
import { getAuthToken } from "@/lib/utils";

interface GitHubOrgInfo {
  id: number;
  github_id: number;
  name: string;
  avatar_url: string | null;
  installation_id: number | null;
  installation_ready: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  role: string;
  joined_at: string;
  github_orgs: GitHubOrgInfo[];
  github_org_name?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization) => void;
  loading: boolean;
  error: string | null;
  refreshOrganizations: () => Promise<void>;
  // Derived permission helpers (calculated from selectedOrganization.role)
  isAdmin: boolean;
  isOwner: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetchBackend.get("/organizations");

      if (response.ok) {
        const orgs = await response.json();
        setOrganizations(orgs);

        // Auto-select first organization if none selected
        if (orgs.length > 0 && !selectedOrganization) {
          setSelectedOrganization(orgs[0]);
        }
      } else {
        setError("Failed to fetch organizations");
      }
    } catch (err) {
      setError("Failed to fetch organizations");
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  // Calculate permission flags based on current user's role in selected organization
  const isOwner = selectedOrganization?.role === "owner";
  const isAdmin = selectedOrganization?.role === "admin" || isOwner;
  const canInviteMembers = isAdmin; // Only admins and owners can invite
  const canManageMembers = isAdmin; // Only admins and owners can manage members

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for invitation acceptance flag and refresh if needed
  useEffect(() => {
    if (router.query.invitation_accepted === "true") {
      // Refresh organizations after invitation acceptance
      fetchOrganizations();
      // Remove the query parameter
      router.replace(router.pathname, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.invitation_accepted]);

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        selectedOrganization,
        setSelectedOrganization,
        loading,
        error,
        refreshOrganizations,
        isAdmin,
        isOwner,
        canInviteMembers,
        canManageMembers,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}
