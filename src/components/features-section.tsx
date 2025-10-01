import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Circle, MoreVertical } from "lucide-react";
import Image from "next/image";
import SectionHeader from "./section-header";

const versionsData = [
  {
    section: "In progress",
    items: [
      {
        id: 1,
        name: "Untitled",
        status: "Copy",
        date: "May 30, 2025",
        icon: "circle" as const,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      },
    ],
  },
  {
    section: "Previous",
    items: [
      {
        id: 2,
        name: "Project Name",
        status: "Published",
        date: "Apr 2, 2025",
        icon: "check" as const,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
    ],
  },
];

const featureCards = [
  {
    id: 1,
    bgColor: "bg-[#d4deff]",
    title: "Familiar WYSIWYG for Teams",
    description:
      "Drag and drop WYSIWYG in the browser over the live site; no local setup, no new jargon.",
    content: (
      <div className="relative self-stretch w-full h-76 bg-[#2a5bfe] rounded-xl overflow-hidden">
        <Image
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          alt="Button context menu"
          src="/images/feature-1.webp"
          width={263}
          height={258}
        />
      </div>
    ),
  },
  {
    id: 2,
    bgColor: "bg-[#fee6fd]",
    title: "Code native Editing",
    description:
      "Anyone can edit copy, layout, and styles directly on top of the existing custom codebase; no forked builders or fragile embeds.",
    content: (
      <div className="bg-[#fc83f5] relative self-stretch overflow-hidden w-full h-76 rounded-xl">
        <Image
          className="absolute left-1/10 top-1/4 max-w-none"
          src="/images/gitdiff.webp"
          alt="Code-native PRs"
          width={450}
          height={150}
        />
      </div>
    ),
  },
  {
    id: 3,
    bgColor: "bg-[#fdf5d2]",
    title: "Zero disruption for Devs",
    description:
      "No change to DX, toolchain, or hosting; integrates via lightweight Chrome extension + minimal code integration snippet. Devs keep control of code and review.",
    content: (
      <div className="relative flex items-center justify-center self-stretch w-full h-76 rounded-xl bg-[#f7cf1d] overflow-hidden">
        <Image
          className="max-w-none rounded-lg"
          src="/images/preview-link.webp"
          alt="Preview Links"
          width={300}
          height={150}
        />
      </div>
    ),
  },
  {
    id: 4,
    bgColor: "bg-[#fedfcc]",
    title: "Built in A/B Experiments",
    description:
      "Generate infinite variants and test new pages without needing engineering to build it.",
    content: (
      <div className="flex items-center self-stretch w-full h-76 rounded-xl bg-[#fc5d00] overflow-hidden">
        <Card className="w-76 h-56 relative -right-8 overflow-hidden shadow-lg border-none bg-white rounded-lg">
          <CardContent className="p-4 flex flex-col items-start gap-4 w-full">
            <h2 className="font-semibold text-base">Versions/Branches</h2>
            {versionsData.map((section, sectionIndex) => (
              <div key={sectionIndex} className="flex flex-col gap-1 w-full">
                <div className="text-sm text-gray-500">{section.section}</div>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-1 rounded w-full text-sm ${
                      section.section === "In progress" ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 w-30 shrink-0">
                      <div
                        className={`flex w-6 h-6 items-center justify-center rounded-md shrink-0 ${item.iconBg}`}
                      >
                        {item.icon === "circle" ? (
                          <Circle className={`w-4 h-4 ${item.iconColor}`} />
                        ) : (
                          <Check className={`w-4 h-4 ${item.iconColor}`} />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 shrink-0">
                      {item.status}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-nowrap shrink-0 ml-auto">
                      {item.date}
                    </div>
                    <Button
                      variant="ghost"
                      className="h-auto p-1 text-gray-500"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    ),
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-12">
        <SectionHeader
          align="left"
          className="w-full lg:w-6/12 lg:sticky lg:top-24"
          badgeText="Features"
          badgeClassName="bg-[#fdf5d2]"
          title="Everything you need to ship faster"
          titleAs="h2"
          titleClassName="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
          descriptionClassName="text-base md:text-lg lg:text-xl leading-relaxed"
          description={
            <>
              CodePress lets designers and marketers update custom-coded
              websites and launch on-brand landing pages,without writing code or
              changing how engineers work. It sits over your live site, speaks
              your design system, and turns edits into production-ready changes.
              Teams get a familiar, drag-and-drop workflow in the browser;
              engineers keep code ownership and quality gates. The result: more
              pages, faster cycles, zero CMS contortions.
            </>
          }
        />
        <div className="w-full lg:w-6/12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureCards.map((card) => (
            <Card
              key={card.id}
              className={`${card.bgColor} flex flex-col items-start gap-6 pt-5 pb-10 px-5 rounded-2xl border-none`}
            >
              <CardContent className="p-0 flex flex-col gap-6 w-full">
                {card.content}
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="font-medium text-base leading-6">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
