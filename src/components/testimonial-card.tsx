import { SectionBadge } from "@/components/ui/section-badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import TestimonialAuthor from "./ui/testimonial-author";
import { cn } from "@/lib/utils";

export const TestimonialCard = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("w-full bg-gray-100 rounded-2xl overflow-hidden border-0", className)}>
      <CardContent className="flex flex-col-reverse lg:flex-row items-center px-6 md:px-10 lg:px-12 gap-8 md:gap-12 lg:gap-14 lg:h-[488px]">
        <div className="flex flex-col w-full lg:w-1/2 items-start gap-10">
          <div className="flex flex-col items-start gap-4 self-stretch">
            <SectionBadge className="bg-[#fee6fd]">
              CodePress in action
            </SectionBadge>
            <h3 className="self-stretch font-semibold text-[#4b4b4b] text-2xl md:text-3xl lg:text-[32px] leading-tight">
              &quot;We cut a 78-slide design-review deck down to zero.
              Designers merged 60+ tweaks before lunch, and our PM shipped a new
              pricing page the same day.&quot;
            </h3>
          </div>
          <TestimonialAuthor
            src="/images/head-of-product-acme.webp"
            alt="Head of product"
            fallbackText="HP"
            name="Head of product"
            company="Acme SaaS"
            nameClassName="text-[#4b4b4b]"
            companyClassName="font-normal text-[#4b4b4b]"
            fallbackClassName="bg-gray-300"
          />
        </div>
        <div className="w-full lg:w-1/2 h-64 lg:h-full bg-[#dfe0e1] rounded-2xl flex items-center justify-center">
          <span className="text-black">GIF</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard; 