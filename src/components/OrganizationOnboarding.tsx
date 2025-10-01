import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthToken } from "@/lib/utils";
import { fetchBackend } from "@/lib/api";

interface OrganizationOnboardingProps {
  onSuccess: (organization: unknown) => void;
  onError: (error: string) => void;
  className?: string;
}

export function OrganizationOnboarding({
  onSuccess,
  onError,
  className,
}: OrganizationOnboardingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      onError("Organization name is required");
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetchBackend.post("/organizations", {
        name: orgName.trim(),
        description: description.trim() || null,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create organization");
      }

      const organization = await response.json();
      onSuccess(organization);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Failed to create organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("max-w-md mx-auto", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Organization</CardTitle>
          <CardDescription>
            Let's set up your workspace to get started with CodePress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrganization} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Your Company or Team Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                disabled={isLoading}
                maxLength={255}
              />
              <p className="text-sm text-gray-500">
                This will be visible to your team members
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="org-description">Description (Optional)</Label>
              <Input
                id="org-description"
                type="text"
                placeholder="Brief description of your organization"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={500}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !orgName.trim()}
            >
              {isLoading ? "Creating..." : "Create Organization"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What's next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll be the owner of this organization</li>
              <li>• You can invite team members later</li>
              <li>• Connect your GitHub repositories</li>
              <li>• Start collaborating with CodePress</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
