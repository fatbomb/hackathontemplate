// app/page.tsx
import HeroSection from "@/components/landing/hero-section";
import FeatureSection from "@/components/landing/feature-section"
import TestimonialSection from "@/components/landing/testomonial-section"
import { CTASection } from "@/components/landing/cta-section"
import SubjectsSection from "@/components/landing/subject-section";
import StatsSection from "@/components/landing/stat-section";

export default function Home() {
  return (
    <main className="flex-grow overflow-hidden">
      <div className="flex flex-col justify-between items-center w-screen overflow-hidden">
        <HeroSection />
      <SubjectsSection />
      <FeatureSection />
      <StatsSection />
      <TestimonialSection />
      <CTASection />
      </div>
    </main>
  );
}