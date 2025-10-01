import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

export const SectionBadge = ({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) => {
  return (
    <Badge
      className={cn(
        "h-auto px-6 py-3.5 rounded-full border-0 text-base font-medium text-black max-h-[32px] lg:max-h-[31px]",
        className
      )}
      {...props}
    />
  );
}; 