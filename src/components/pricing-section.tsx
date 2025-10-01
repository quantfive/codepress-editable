import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VariantProps } from "class-variance-authority";
import React, { useState } from "react";
import SectionHeader from "./section-header";
import WaitlistModal from "@/components/waitlist-modal";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

interface PricingPlan {
  title: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  buttonText: string;
  buttonVariant: ButtonVariant;
}

const pricingPlans: PricingPlan[] = [
  {
    title: "Individual",
    price: "$12",
    period: "/ mo",
    badge: "Beta price (normally $20/mo)",
    features: ["For freelancers and solo builders"],
    buttonText: "Join the Waitlist",
    buttonVariant: "yellow",
  },
  {
    title: "Company",
    price: "$49",
    period: "/builder/mo",
    features: ["Unlimited repos", "Shared dashboard across teams"],
    buttonText: "Join the Waitlist",
    buttonVariant: "pink",
  },
  {
    title: "Enterprise",
    price: "Talk to our team for pricing",
    features: [
      "Advanced security & access controls",
      "Dedicated support & SLAs",
      "Custom onboarding",
    ],
    buttonText: "Contact us",
    buttonVariant: "blue",
  },
];

export const PricingSection = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState<string | undefined>(
    undefined
  );
  return (
    <section id="pricing" className="py-12 md:py-16 bg-[#f0eff1]">
      <div className="container mx-auto px-4">
        <SectionHeader
          badgeText="Pricing"
          badgeClassName="bg-[#fdf5d2]"
          title="Choose a plan"
          description=""
          descriptionClassName="hidden"
        />
        <div className="flex flex-col lg:flex-row justify-center gap-6 mt-12">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className="flex flex-col w-full h-auto bg-white rounded-2xl border-0 py-0"
            >
              <CardContent className="flex flex-col h-full p-6 lg:p-8 gap-4 lg:gap-6">
                <div className="flex flex-col items-start gap-4 lg:gap-6 w-full">
                  <h3 className="font-medium text-3xl tracking-tight">
                    {plan.title}
                  </h3>
                  <div className="relative w-full flex items-center h-14">
                    {plan.period ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-semibold">
                          {plan.price}
                        </span>
                        <span className="text-[#4b4b4b] text-base whitespace-nowrap">
                          {plan.period}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xl font-semibold leading-tight">
                        {plan.price}
                      </div>
                    )}
                  </div>

                  {plan.badge && (
                    <Badge className="bg-[#fdf5d2] text-black px-4 py-2 rounded-full font-medium text-sm">
                      {plan.badge}
                    </Badge>
                  )}
                  <div className="flex flex-col items-start gap-2">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="text-[#4b4b4b] text-base"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-grow" />
                <Button
                  size="hero"
                  variant={plan.buttonVariant}
                  className="w-full"
                  onClick={() => {
                    if (plan.buttonText === "Join the Waitlist") {
                      setWaitlistSource(`pricing-${plan.title.toLowerCase()}`);
                      setShowWaitlist(true);
                    } else if (plan.buttonText === "Contact us") {
                      window.location.href =
                        "mailto:team@codepress.dev?subject=Enterprise%20Inquiry";
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
          <WaitlistModal
            open={showWaitlist}
            onOpenChange={setShowWaitlist}
            source={waitlistSource}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
