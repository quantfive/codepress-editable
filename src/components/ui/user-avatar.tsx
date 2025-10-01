import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getGradientCSSBySeed, getTextColorBySeed } from "@/lib/gradients";

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  login?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  src,
  name,
  email,
  login,
  alt,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const displayKey = (name || email || login || "User").trim();

  const getUserInitials = React.useCallback((raw: string) => {
    if (!raw) return "U";
    const value = raw.trim();
    const spaceParts = value.split(/\s+/).filter(Boolean);
    if (spaceParts.length >= 2) {
      return (
        spaceParts[0].charAt(0) + spaceParts[spaceParts.length - 1].charAt(0)
      )
        .toUpperCase()
        .slice(0, 2);
    }
    const sepParts = value.split(/[._-]+/).filter(Boolean);
    if (sepParts.length >= 2) {
      return (sepParts[0].charAt(0) + sepParts[1].charAt(0)).toUpperCase();
    }
    return (
      value
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  }, []);

  const gradientCSS = React.useMemo(
    () => getGradientCSSBySeed(displayKey),
    [displayKey]
  );

  const textColor = React.useMemo(
    () => getTextColorBySeed(displayKey),
    [displayKey]
  );

  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={alt || displayKey} /> : null}
      <AvatarFallback
        className={"text-[10px] font-semibold " + (fallbackClassName || "")}
        style={{
          backgroundImage: gradientCSS,
          color: textColor,
        }}
      >
        {getUserInitials(displayKey)}
      </AvatarFallback>
    </Avatar>
  );
}
