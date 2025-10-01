import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, X } from "lucide-react";
import { fetchBackend } from "@/lib/api";
import { getAuthToken } from "@/lib/utils";

interface InviteMembersProps {
  organizationId?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  variant?: "sidebar" | "button";
}

interface EmailTag {
  email: string;
  role: string;
}

export function InviteMembers({
  organizationId,
  onSuccess,
  onError,
  variant = "sidebar",
}: InviteMembersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailTags, setEmailTags] = useState<EmailTag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  const roles = [
    {
      value: "member",
      label: "Member",
      description: "Can access and contribute to repositories",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Can manage organization settings and members",
    },
    {
      value: "owner",
      label: "Owner",
      description: "Full access to organization",
    },
  ];

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Add email tag
  const addEmailTag = (email: string) => {
    const trimmedEmail = email.trim();
    if (
      trimmedEmail &&
      isValidEmail(trimmedEmail) &&
      !emailTags.some((tag) => tag.email === trimmedEmail)
    ) {
      setEmailTags((prev) => [
        ...prev,
        { email: trimmedEmail, role: "member" },
      ]);
    }
  };

  // Remove email tag
  const removeEmailTag = (emailToRemove: string) => {
    setEmailTags((prev) => prev.filter((tag) => tag.email !== emailToRemove));
  };

  // Update role for specific email tag
  const updateTagRole = (email: string, newRole: string) => {
    setEmailTags((prev) =>
      prev.map((tag) => (tag.email === email ? { ...tag, role: newRole } : tag))
    );
  };

  // Handle input changes and tag creation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear error messages when user starts typing
    if (localError) {
      setLocalError("");
    }

    // Check for comma
    if (value.includes(",")) {
      const emails = value.split(",");
      const lastEmail = emails.pop()?.trim() || "";

      // Add all complete emails as tags
      emails.forEach((email) => {
        if (email.trim()) {
          addEmailTag(email);
        }
      });

      setInputValue(lastEmail);
      return;
    }

    setInputValue(value);
  };

  // Handle key presses
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmailTag(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && emailTags.length > 0) {
      // Remove last tag when backspacing on empty input
      e.preventDefault();
      setEmailTags((prev) => prev.slice(0, -1));
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setLocalError("");
    setLocalSuccess("");

    // Add current input value as tag if it's valid
    if (inputValue.trim()) {
      addEmailTag(inputValue);
      setInputValue("");
      return; // Let user review the added tag before submitting
    }

    if (!organizationId) {
      setLocalError("Organization ID is required");
      return;
    }

    if (emailTags.length === 0) {
      setLocalError(
        "Please add at least one email address before sending invitations"
      );
      return;
    }

    const invitationList = emailTags;

    setIsLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const results = [];
      const errors = [];

      // Send invitations one by one
      for (const { email, role } of invitationList) {
        try {
          const response = await fetchBackend.post(
            `/organizations/${organizationId}/invite`,
            {
              email: email,
              role: role,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            errors.push(
              `${email}: ${errorData.detail || "Failed to send invitation"}`
            );
          } else {
            const invitation = await response.json();
            results.push(invitation);
          }
        } catch (err) {
          errors.push(
            `${email}: ${
              err instanceof Error ? err.message : "Failed to send invitation"
            }`
          );
        }
      }

      // Clear form and show results
      setEmailTags([]);
      setInputValue("");

      if (results.length > 0) {
        const successMessage =
          results.length === 1
            ? `Invitation sent to ${results[0].email}`
            : `${results.length} invitations sent successfully`;
        onSuccess?.(successMessage); // Call parent for dashboard updates

        // Close modal immediately on success
        setIsDialogOpen(false);
      }

      if (errors.length > 0) {
        setLocalError(errors.join(", ")); // Show errors in modal
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitations";
      setLocalError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Clear messages when dialog closes
          setLocalError("");
          setLocalSuccess("");
        }
      }}
    >
      <DialogTrigger asChild>
        {variant === "button" ? (
          <Button className="bg-cyan hover:bg-cyan/90 text-white">
            Invite members
          </Button>
        ) : (
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Users className="w-5 h-5" />
            <span>Invite members</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-4 py-4">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-cyan/10 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-cyan" />
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              Invite your team
            </h2>
            <p className="text-gray-600">
              Collaboration is better together. Invite your designers,
              developers, and PMs.
            </p>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="mx-auto w-full p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg text-center">
              {localError}
            </div>
          )}

          {/* Success Message */}
          {localSuccess && (
            <div className="mx-auto w-full p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg text-center">
              {localSuccess}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
            <div className="space-y-3">
              {/* Email Input */}
              <Input
                id="emails"
                type="email"
                placeholder="Emails, comma separated"
                autoComplete="off"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                className="w-full h-12 px-4 text-base"
              />

              {/* Email Tags */}
              {emailTags.length > 0 && (
                <div className="space-y-2 text-left">
                  {emailTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border border-gray rounded-lg"
                    >
                      <span className="text-sm text-gray-900">{tag.email}</span>
                      <div className="flex items-center gap-2">
                        <Select
                          value={tag.role}
                          onValueChange={(newRole) =>
                            updateTagRole(tag.email, newRole)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-24 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((roleOption) => (
                              <SelectItem
                                key={roleOption.value}
                                value={roleOption.value}
                                className="text-xs"
                              >
                                {roleOption.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          onClick={() => removeEmailTag(tag.email)}
                          className="p-1 hover:bg-gray-200 rounded-sm text-gray-400 hover:text-red-600"
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-cyan hover:bg-cyan/90 text-white font-medium rounded-lg"
              disabled={isLoading || !organizationId}
            >
              {isLoading ? "Sending invites..." : "Send Invites"}
            </Button>
          </form>

          {/* Billing Note */}
          <p className="text-sm text-gray-500 pt-2">
            Each new member will be billed at $40/month.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
