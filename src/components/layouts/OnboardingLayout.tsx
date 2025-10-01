import React from "react";
import { BlurCircle } from "../hero-section";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4deff] to-[#e8f0ff]">
      <BlurCircle className="w-80 h-80 -top-20 -left-20 md:w-[637px] md:h-[637px] md:top-0 md:-left-9 bg-[#fee6fd] z-0" />
      <BlurCircle className="w-60 h-60 -top-24 right-0 md:w-96 md:h-96 md:-top-44 md:right-[170px] bg-[#fedfcc] z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
