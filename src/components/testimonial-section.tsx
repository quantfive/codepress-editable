import { Card, CardContent } from "@/components/ui/card";
import { SectionBadge } from "@/components/ui/section-badge";
import React from "react";
import TestimonialAuthor from "./ui/testimonial-author";

const logoCards = [
  { id: 1, text: "Logo" },
  { id: 2, text: "Logo" },
  { id: 3, text: "Logo" },
];

export const TestimonialSection = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 flex flex-col items-center gap-12 md:gap-16">
        <div className="flex flex-col w-full max-w-6xl items-center gap-4 text-center">
          <SectionBadge className="bg-[#d4deff] hover:bg-[#d4deff]">
            Trusted by teams at
          </SectionBadge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-black max-w-4xl">
            &quot;Our designers merged 60+ fixes in one day - no engineer touched
            the code.&quot;
          </h2>
          <TestimonialAuthor
            className="mt-4"
            src="/images/head-of-product-acme.webp"
            alt="Head of product at Acme SaaS"
            fallbackText="HP"
            name="Head of product"
            company="Acme SaaS"
            nameClassName="text-gray-900"
            companyClassName="text-gray-600"
          />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
          {logoCards.map((logo) => (
            <Card
              key={logo.id}
              className="relative flex-1 w-full md:w-auto grow h-42 bg-gray-50 border-0"
            >
              <CardContent className="flex items-center justify-center h-full p-0">
                <div className="font-normal text-black text-xl">
                  {logo.text}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection; 