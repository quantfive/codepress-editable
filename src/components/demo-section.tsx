import React from "react";
import SectionHeader from "./section-header";

export default function DemoSection() {
  return (
    <section id="demo" className="pt-32 pb-12 md:pb-16 bg-white">
      <div className="container mx-auto px-4 flex flex-col items-center gap-14 md:gap-16 lg:gap-18">
        <SectionHeader
          badgeText="Demo"
          badgeClassName="bg-[#fdf5d2]"
          title="Try CodePress"
          description="Click any text or spacing below, make a change, and hit Publish to
              watch CodePress ship your edits live."
          descriptionClassName="max-w-2xl font-normal"
        />
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200/80">
            {/* Frame header */}
            <div className="h-11 flex items-center px-4 gap-1.5 bg-slate-100 border-b border-slate-200">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              {/* Fake URL bar */}
              <div className="flex-grow flex items-center justify-center">
                  <div className="bg-white rounded-full text-sm text-slate-500 px-4 py-1.5 w-full max-w-md text-center">
                      codepress.dev
                  </div>
              </div>
              {/* Spacer to balance the dots */}
              <div className="w-9"></div>
            </div>
            {/* Iframe content */}
            <div className="w-full bg-white">
              <iframe
                src="/?edit=true"
                className="w-full h-[688px] border-0"
                title="CodePress Demo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 