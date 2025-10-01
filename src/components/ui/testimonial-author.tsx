import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";

interface TestimonialAuthorProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  fallbackText: string;
  name: string;
  company: string;
  nameClassName?: string;
  companyClassName?: string;
  fallbackClassName?: string;
}

export const TestimonialAuthor = ({
  src,
  alt,
  fallbackText,
  name,
  company,
  className,
  nameClassName,
  companyClassName,
  fallbackClassName,
}: TestimonialAuthorProps) => {
  return (
    <div className={cn("inline-flex items-center gap-4", className)}>
      <Avatar className="w-12 h-12">
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className={cn(fallbackClassName)}>
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start justify-center">
        <div className={cn("text-base font-semibold", nameClassName)}>
          {name}
        </div>
        <div className={cn("text-base", companyClassName)}>{company}</div>
      </div>
    </div>
  );
};

export default TestimonialAuthor; 