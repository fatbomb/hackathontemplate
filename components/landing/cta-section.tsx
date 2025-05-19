// components/landing/cta-section.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-primary/5 py-20 w-full">
      <div className="px-4 md:px-6 container">
        <div className="flex flex-col justify-center items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tighter">Ready to Get Started?</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Join thousands of developers building amazing products with our toolkit.
            </p>
          </div>
          <div className="flex min-[400px]:flex-row flex-col gap-2">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create Free Account
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="https://github.com/yourusername/your-repo">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}