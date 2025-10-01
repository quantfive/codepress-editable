import { BlurCircle } from "./hero-section";
import SectionHeader from "./section-header";
export default function MissionSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#fde6fd] to-[#e8f0ff] overflow-hidden">
      <BlurCircle className="w-72 h-72 -top-38 -left-40 md:w-96 md:h-96 md:-top-51 md:-left-24 bg-[#fedfcc]" />
      <BlurCircle className="w-72 h-72 top-[-80px] -right-32 md:w-96 md:h-96 md:-top-15 md:-right-20 lg:left-[880px] lg:right-auto bg-[#d4deff]" />

      <div className="flex flex-col items-center gap-18 relative z-10 px-10 py-20">
        <div className="flex flex-col items-center text-center gap-8 md:gap-12 lg:gap-16">
          <div className="max-w-4xl mx-auto text-center z-10">
            <SectionHeader
              title="Our Mission"
              titleAs="h2"
              titleClassName="self-stretch"
              description="Give everyone the power of production grade web publishing, while engineers keep ownership of the code."
              descriptionClassName="md:text-3xl leading-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
