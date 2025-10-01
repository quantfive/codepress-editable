import { Card, CardContent } from "@/components/ui/card";
import { SectionBadge } from "@/components/ui/section-badge";
import { cn } from "@/lib/utils";
import {
  FileJson2,
  LayoutTemplate,
  PencilRuler,
  SquareLibrary,
} from "lucide-react";

const roadmapItems = [
  {
    id: "edit",
    title: "Edit Styles and Content",
    description:
      "Empower users to modify the look and feel of their sites directly in the browser with an intuitive visual editor.",
    icon: PencilRuler,
    status: "Done",
  },
  {
    id: "component-studio",
    title: "Component Studio",
    description:
      "Design, build, and manage reusable UI components with ease, fostering consistency across projects.",
    icon: SquareLibrary,
    status: "In Development",
  },
  {
    id: "page-builder",
    title: "Page Builder",
    description:
      "Assemble full pages effortlessly using your own components and styles—no code required.",
    icon: LayoutTemplate,
    status: "In Development",
  },
  {
    id: "full-stack-apps",
    title: "Full-stack apps",
    description:
      "Generate production-ready backend and frontend code to launch complete applications instantly.",
    icon: FileJson2,
    status: "Coming Soon",
  },
];

export const RoadmapSection = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start text-left gap-6 mb-16">
          <SectionBadge className="bg-[#ccf1ff] hover:bg-[#ccf1ff] rounded-full text-black">
            Roadmap
          </SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter max-w-3xl text-black">
            Today: UI fixes.
            <br />
            Next: AI-built apps
          </h1>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-200 -translate-x-1/2 md:hidden" />
          <div className="relative flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
            {roadmapItems.map((item) => {
              const IconComponent = item.icon;
              const isDone = item.status === "Done";
              const isInDevelopment = item.status === "In Development";
              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center w-full md:flex-1"
                >
                  <Card
                    className={cn(
                      "relative w-full flex-col justify-center items-center gap-2.5 inline-flex px-6 py-4 rounded-2xl min-h-60 border-none",
                      {
                        "bg-[#ccf1ff]": isDone,
                        "bg-[#FDF5D2]": isInDevelopment,
                        "bg-gray-100": !isDone && !isInDevelopment,
                      }
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        {
                          "bg-[#00b9ff] text-white": isDone,
                          "bg-[#F7CF1D] text-white": isInDevelopment,
                          "bg-gray-400 text-white": !isDone && !isInDevelopment,
                        }
                      )}
                    >
                      {item.status}
                    </span>
                    <CardContent className="p-0 flex-col justify-start items-center gap-2.5 flex">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          {
                            "bg-[#00b9ff]": isDone,
                            "bg-[#F7CF1D]": isInDevelopment,
                            "bg-gray-400": !isDone && !isInDevelopment,
                          }
                        )}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={cn("w-6 h-6", "text-white")}
                          />
                        )}
                      </div>
                      <div className="text-black text-base font-medium h-8 flex items-center justify-center text-center w-full">
                        {item.title}
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
