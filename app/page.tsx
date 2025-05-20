// app/page.tsx
import { HeroSection } from "@/components/landing/hero-section"
import { FeatureSection } from "@/components/landing/feature-section"
import { TestimonialSection } from "@/components/landing/testomonial-section"
import { CTASection } from "@/components/landing/cta-section"

export default function Home() {
  return (
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <TestimonialSection />
        <CTASection />
      </main>
  )
}