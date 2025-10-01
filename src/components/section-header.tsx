import React from "react";
import { SectionBadge } from "./ui/section-badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badgeText?: string;
  badgeClassName?: string;
  title: string;
  description: React.ReactNode;
  titleAs?: "h1" | "h2";
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
  align?: "center" | "left";
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  badgeText,
  badgeClassName,
  title,
  description,
  titleAs = "h2",
  titleClassName,
  descriptionClassName,
  className,
  align = "center",
}) => {
  const TitleComponent = titleAs;

  const alignmentClasses = {
    center: "items-center text-center mx-auto",
    left: "items-start text-left",
  };

  return (
    <div
      className={cn("max-w-4xl flex flex-col gap-4", alignmentClasses[align], className)}
    >
      {badgeText && <SectionBadge className={cn(badgeClassName)}>
        {badgeText}
      </SectionBadge>}
      <TitleComponent
        className={cn("font-semibold text-black text-4xl md:text-5xl lg:text-[64px] tracking-[-1.92px] leading-tight lg:leading-[68px]", titleClassName)}
      >
        {title}
      </TitleComponent>
      <p
        className={cn("text-lg md:text-xl text-[#4b4b4b] leading-7", descriptionClassName)}
      >
        {description}
      </p>
    </div>
  );
};

export default SectionHeader; 
