import AdvantagesSection from "@/components/advantages-section";
import FaqSection from "@/components/faq-section";
import FeaturesSection from "@/components/features-section";
import FinalSection from "@/components/final-section";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import MissionSection from "@/components/mission-section";
import ProcessSection from "@/components/process-section";
import RoadmapSection from "@/components/roadmap-section";
import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const baseUrl = "https://editable.codepress.dev";
  const pageUrl = `${baseUrl}/`;
  const title = "CodePress | Ship UI without waiting on engineering";
  const description =
    "The AI-powered canvas for designers, PMs, and marketers to make production-ready changes to your app or website. No coding required.";
  const previewImage = `${baseUrl}/images/product-preview.webp`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CodePress",
    description:
      "The AI-powered canvas that empowers designers, PMs, and marketers to make production-ready changes to your app or website. No coding required.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "12.00",
      priceCurrency: "USD",
    },
    url: pageUrl,
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={previewImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={previewImage} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <Header />
      <main>
        <HeroSection />
        <AdvantagesSection />
        <MissionSection />
        <FeaturesSection />
        <ProcessSection />
        <RoadmapSection />
        <FaqSection />
        <FinalSection />
      </main>
    </div>
  );
}
