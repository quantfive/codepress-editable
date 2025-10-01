import React, { useState } from "react";
import { useOrganization } from "@/lib/organization-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { fetchBackend } from "@/lib/api";

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

interface OrganizationSelectorProps {
  className?: string;
  placeholder?: string;
}

export default function OrganizationSelector({
  className = "",
  placeholder = "Select organization...",
}: OrganizationSelectorProps) {
  const {
    organizations,
    selectedOrganization,
    setSelectedOrganization,
    loading,
    error,
    refreshOrganizations,
  } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsOpen(false);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetchBackend.post("/organizations", {
        name: newOrgName.trim(),
      });

      if (response.ok) {
        const newOrg = await response.json();

        // Refresh the organizations list
        await refreshOrganizations();

        // Close dialogs and reset form
        setShowCreateDialog(false);
        setIsOpen(false);
        setNewOrgName("");

        // Select the newly created organization
        const orgForSelection = {
          id: newOrg.id,
          name: newOrg.name,
          slug: newOrg.slug,
          description: null,
          avatar_url: newOrg.avatar_url,
          role: "owner",
          joined_at: newOrg.created_at,
          github_orgs: [],
        };
        setSelectedOrganization(orgForSelection);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setCreateError(errorData.detail || "Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      setCreateError("Failed to create organization. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateDialogClose = () => {
    setShowCreateDialog(false);
    setNewOrgName("");
    setCreateError(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xs">!</span>
        </div>
        <span className="text-red-600 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer w-full text-left"
      >
        {selectedOrganization ? (
          <>
            <UserAvatar
              src={selectedOrganization.avatar_url}
              name={selectedOrganization.name}
              alt={selectedOrganization.name}
              className="w-10 h-10"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">
                {selectedOrganization.name}
              </span>
            </div>
          </>
        ) : (
          <>
            <UserAvatar name="?" className="w-10 h-10" />
            <span className="text-gray-500 flex-1">{placeholder}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-[fit-content] min-w-[280px] bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {organizations.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No organizations available
            </div>
          ) : (
            organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrganizationSelect(org)}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors text-left ${
                  selectedOrganization?.id === org.id
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <UserAvatar
                  src={org.avatar_url}
                  name={org.name}
                  alt={org.name}
                  className="w-8 h-8"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{org.name}</div>
                  {org.description && (
                    <div className="text-sm text-gray-500 truncate">
                      {org.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {org.role && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {org.role}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}

          {/* Create New Organization Button */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={() => {
                setShowCreateDialog(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Create new organization
                </div>
                <div className="text-sm text-gray-500">
                  Start fresh with a new workspace
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleCreateDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage your projects and team
              members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="orgName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Organization Name
              </label>
              <Input
                id="orgName"
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter organization name"
                disabled={isCreating}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCreating) {
                    handleCreateOrganization();
                  }
                }}
              />
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-800 text-sm">{createError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCreateDialogClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrganization}
                disabled={isCreating || !newOrgName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
