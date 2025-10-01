import Image from "next/image";
import React from "react";
import SectionHeader from "./section-header";

const processSteps = [
  {
    number: "1",
    title: "Install a tiny plugin",
    description:
      "Add our small @quantfive/codepress-engine package to your codebase's build process. This allows CodePress to index and enrich your repo.",
  },
  {
    number: "2",
    title: "Install our Chrome Extension",
    description:
      "The extension connects your site to CodePress, letting your team edit content and layout in context.",
  },
  {
    number: "3",
    title: "Edit visually, commit safely",
    description:
      "Non-technical teammates update copy, layout, and theme variables in a WYSIWYG canvas directly on your website. CodePress opens a branch + PR with clean, diff-friendly commits.",
  },
  {
    number: "4",
    title: "Approve & merge",
    description:
      "Developers review atomic changes just like normal GitHub pull requests.",
  },
];

export const ProcessSection = () => {
  return (
    <section id="process" className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-12">
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 2xl:static">
            <Image
              src="/images/process-preview.webp"
              alt="CodePress process preview"
              width={1284}
              height={1395}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <div className="w-full lg:w-1/2 2xl:sticky 2xl:top-24">
            <SectionHeader
              align="left"
              badgeText="Process"
              badgeClassName="bg-[#fedfcc]"
              title="How CodePress works"
              titleAs="h2"
              description=""
              descriptionClassName="hidden"
              className="!max-w-none"
            />
            <div className="flex flex-col gap-8 mt-8">
              {processSteps.map((step) => (
                <div key={step.number} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#d4deff] rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-[#2a5bfe]">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-black">{step.title}</h3>
                    <p className="text-base text-[#4b4b4b] whitespace-pre-line">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection; 
