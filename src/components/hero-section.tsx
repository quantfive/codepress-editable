import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import WaitlistModal from "@/components/waitlist-modal";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
export const BlurCircle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    aria-hidden="true"
    className={cn("absolute rounded-full blur-[150px]", className)}
    {...props}
  />
);

export default function HeroSection() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  return (
    <section className="relative bg-gradient-to-br from-[#d4deff] to-[#e8f0ff] overflow-hidden">
      <BlurCircle className="w-80 h-80 -top-20 -left-20 md:w-[637px] md:h-[637px] md:top-0 md:-left-9 bg-[#fee6fd]" />
      <BlurCircle className="w-60 h-60 -top-24 right-0 md:w-96 md:h-96 md:-top-44 md:right-[170px] bg-[#fedfcc]" />

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 md:gap-7 lg:gap-8">
          <h1 className="text-3xl md:text-5xl lg:text-[64px] font-semibold tracking-[-1.92px] leading-tight lg:leading-[68px] bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-700">
            The IDE for everyone else
          </h1>
          <p className="text-lg md:text-xl text-[#4b4b4b] max-w-4xl leading-7 max-w-[90%]">
            A CMS & visual editor that integrates seamlessly into your codebase
            so non-technical teammates can publish fast without changing how
            developers build.
            <br />
            <br />
            Think Squarespace for your custom codebase.
          </p>
          <Button
            variant="hero"
            size="hero"
            onClick={() => setShowWaitlist(true)}
          >
            <div className="absolute w-[166px] h-[166px] -top-7 -right-12 bg-[#fc83f5] rounded-full blur-2xl opacity-50" />
            <span className="relative z-10">Join the Waitlist</span>
          </Button>
          <WaitlistModal
            open={showWaitlist}
            onOpenChange={setShowWaitlist}
            source="hero"
          />

          <div className="w-full aspect-video mt-4">
            <VideoPlayer
              src="https://pub-77461d81a3c047a490d3e7e531d08538.r2.dev/codepress-demo-sheena-final.mp4"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
