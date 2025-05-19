import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, Zap, Shield, BarChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 xl:py-48 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl/none tracking-tighter">
                  Your Powerful Hackathon Project
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Build something amazing with our feature-rich platform. Fast, reliable, and designed for the modern web.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-100 dark:bg-gray-800 py-12 md:py-24 lg:py-32 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col justify-center items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl md:text-4xl tracking-tighter">
                  Key Features
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Everything you need to build your next project.
                </p>
              </div>
            </div>
            <div className="gap-6 lg:gap-12 grid grid-cols-1 md:grid-cols-3 mx-auto mt-8 max-w-5xl">
              {/* Feature 1 */}
              <div className="flex flex-col items-center space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="bg-blue-500 bg-opacity-10 p-2 rounded-full">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-xl">Lightning Fast</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  Built for performance and optimized for speed.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="bg-green-500 bg-opacity-10 p-2 rounded-full">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-xl">Secure by Default</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  Enterprise-grade security built into every feature.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="flex flex-col items-center space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="bg-purple-500 bg-opacity-10 p-2 rounded-full">
                  <BarChart className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-bold text-xl">Advanced Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  Gain insights with powerful data visualization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col justify-center items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl md:text-4xl tracking-tighter">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Join thousands of users already using our platform.
                </p>
              </div>
              <div className="space-y-2 w-full max-w-sm">
                <Button asChild className="w-full" size="lg">
                  <Link href="/signup">Sign Up Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}