// components/landing/hero-section.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 py-20 md:py-32 lg:py-40 w-full">
      <div className="px-4 md:px-6 container">
        <div className="flex flex-col justify-center items-center space-y-6 text-center">
          <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl/none tracking-tighter">
            Build Beautiful Experiences with
            <span className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-transparent"> Next.js</span>
          </h1>
          <p className="max-w-[700px] text-gray-500 dark:text-gray-400 lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
            Your all-in-one solution for creating modern, responsive web applications in record time. Perfect for hackathons, startups, and beyond.
          </p>
          <div className="flex min-[400px]:flex-row flex-col gap-2">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}