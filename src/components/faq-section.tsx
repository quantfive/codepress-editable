import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

const faqData = [
  {
    id: "item-1",
    question: "Does it work with our design system?",
    answer:
      "Yes. CodePress automatically detects your design tokens, component libraries, and naming conventions, and ensures all edits adhere to your existing system.",
  },
  {
    id: "item-2",
    question: "Which frameworks are supported?",
    answer:
      "We officially support Next.js and React apps. We are working on supporting all major frameworks and plan to be fully framework-agnostic.",
  },
  {
    id: "item-3",
    question: "Is it safe on production?",
    answer:
      "Absolutely. CodePress only analyzes your code and never runs it. It's built with security as a top priority and is safe for production environments.",
  },
];

const FaqSection = () => {
  return (
    <section className="bg-white w-full py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 max-w-[890px]">
        <div className="flex flex-col items-center gap-12 md:gap-16 lg:gap-18">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-black">
            FAQ
          </h2>
          <div className="w-full">
            <Accordion
              type="single"
              collapsible
              defaultValue="item-1"
              className="w-full"
            >
              {faqData.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="px-4 sm:px-5 data-[state=open]:bg-gray-50 data-[state=open]:rounded-2xl data-[state=open]:border-b-0"
                >
                  <AccordionTrigger className="py-4 md:py-6 text-left text-base md:text-lg font-semibold hover:no-underline text-black">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 md:pb-6 text-base text-gray-900">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection; 
