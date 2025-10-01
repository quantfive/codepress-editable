import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import WaitlistModal from "@/components/waitlist-modal";

const BlurCircle = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    aria-hidden="true"
    className={cn("absolute rounded-full blur-[150px]", className)}
    {...props}
  />
);

const Footer = () => (
  <footer className="w-full">
    <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Image
          src="/logo.svg"
          alt="Code Press Logo"
          width={89}
          height={32}
          className="h-auto"
        />
        <p className="text-sm text-[#4b4b4b]">
          Visual editing for production sites—design and deploy in real-time
        </p>
      </div>
      <p className="text-sm text-[#4b4b4b]">
        © 2025 CodePress. All rights reserved.
      </p>
    </div>
  </footer>
);

export default function FinalSection() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  return (
    <section className="relative bg-gradient-to-br from-[#fde6fd] to-[#e8f0ff] overflow-hidden">
      <BlurCircle className="w-72 h-72 -top-38 -left-40 md:w-96 md:h-96 md:-top-51 md:-left-24 bg-[#fedfcc]" />
      <BlurCircle className="w-72 h-72 top-[-80px] -right-32 md:w-96 md:h-96 md:-top-15 md:-right-20 lg:left-[880px] lg:right-auto bg-[#d4deff]" />

      <div className="flex flex-col items-center gap-18 relative z-10 px-10 pt-12 md:pt-16 lg:pt-20 pb-4">
        <div className="flex flex-col items-center text-center gap-8 md:gap-12 lg:gap-16">
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight leading-tight text-black">
            Ready to ship without the backlog?
          </h2>
          <Button
            variant="final"
            size="hero"
            onClick={() => setShowWaitlist(true)}
          >
            <span className="relative z-10">Join the Waitlist</span>
          </Button>
          <WaitlistModal
            open={showWaitlist}
            onOpenChange={setShowWaitlist}
            source="final"
          />
        </div>
        <Footer />
      </div>
    </section>
  );
}
