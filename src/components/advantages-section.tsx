import { Card, CardContent } from "@/components/ui/card";
import { FastForward, Shredder, Signature } from "lucide-react";
import Image from "next/image";
import SectionHeader from "./section-header";

const advantageCards = [
  {
    id: 1,
    title: "On brand landing pages",
    description:
      "Create unlimited, ultra targeted landing pages that inherit the site's design system and components in minutes; Scale targeted pages for SEO or paid ads that stay perfectly on brand.",
    bgColor: "bg-[#fee6fd]",
    iconBg: "bg-[#fc83f5]",
    iconSrc: "/icons/icon-backlog-bloat.svg",
    icon: Signature,
  },
  {
    id: 2,
    title: "Reduce engineering tickets",
    description:
      "Make and test changes without back and forth. Preview changes live, share a link, and merge when everyone's happy.",
    bgColor: "bg-[#fdf5d2]",
    iconBg: "bg-[#f7cf1d]",
    iconSrc: "/icons/icon-ping-pong.svg",
    icon: Shredder,
  },
  {
    id: 3,
    title: "Fast shipping loop",
    description:
      "Minutes from idea → published page; eliminates tickets, handoffs, and CMS plumbing. Cut page launch time from weeks to minutes.",
    bgColor: "bg-[#ccf1ff]",
    iconBg: "bg-[#00b9ff]",
    iconSrc: "/icons/icon-slow-experiments.svg",
    icon: FastForward,
  },
];

export const AdvantagesSection = () => {
  return (
    <section id="advantages" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <SectionHeader
          badgeText="Advantages"
          badgeClassName="bg-[#fedfcc]"
          title="Why designers and PMs love it"
          titleAs="h2"
          titleClassName="self-stretch"
          description="CodePress eliminates the frustrating bottlenecks that slow your team down."
          descriptionClassName="self-stretch font-normal tracking-normal"
        />
        <div className="grid w-full gap-6 lg:grid-cols-3 mt-18">
          {advantageCards.map((card) => (
            <Card
              key={card.id}
              className={`flex flex-col ${card.bgColor} rounded-2xl border-0`}
            >
              <CardContent className="flex flex-1 flex-col items-start gap-4 p-6 lg:p-10">
                <div
                  className={`relative w-12 h-12 ${card.iconBg} rounded-full overflow-hidden`}
                >
                  {card.icon ? (
                    <card.icon className="absolute w-6 h-6 top-3 left-3 object-cover text-white" />
                  ) : (
                    <Image
                      className="absolute w-6 h-6 top-3 left-3 object-cover"
                      alt={`${card.title} icon`}
                      src={card.iconSrc}
                      width={24}
                      height={24}
                    />
                  )}
                </div>
                <h3 className="font-semibold text-2xl lg:text-[28px] leading-normal w-fit text-black tracking-normal">
                  {card.title}
                </h3>
                <p className="self-stretch font-medium text-black text-base tracking-normal leading-6">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* <TestimonialCard className="mt-32" /> */}
      </div>
    </section>
  );
};

export default AdvantagesSection;
