// components/landing/feature-section.tsx
import { 
    Zap, Shield, RefreshCw, Layers, 
    Smartphone, PaintBucket, Code, Maximize 
  } from "lucide-react"
  
  export function FeatureSection() {
    return (
      <section className="bg-background py-20 w-full" id="features">
        <div className="px-4 md:px-6 container">
          <div className="flex flex-col justify-center items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block bg-muted px-3 py-1 rounded-lg text-sm">Features</div>
              <h2 className="font-bold text-3xl sm:text-5xl tracking-tighter">Everything You Need</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Our platform provides all the essential components to build beautiful, functional applications.
              </p>
            </div>
          </div>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto py-12 max-w-5xl">
            <FeatureCard 
              title="Modern UI Components" 
              description="Pre-built, customizable UI components based on shadcn/ui."
              icon={<Layers className="w-10 h-10 text-primary" />}
            />
            <FeatureCard 
              title="Authentication Ready" 
              description="Secure login, signup, and password reset flows out of the box."
              icon={<Shield className="w-10 h-10 text-primary" />}
            />
            <FeatureCard 
              title="Fast Performance" 
              description="Built with Next.js for optimal loading speed and SEO."
              icon={<Zap className="w-10 h-10 text-primary" />}
            />
            <FeatureCard 
              title="Responsive Design" 
              description="Looks great on all devices from phones to desktops."
              icon={<Smartphone className="w-10 h-10 text-primary" />}
            />
            <FeatureCard 
              title="Theming Support" 
              description="Easy dark/light mode switching with customizable colors."
              icon={<PaintBucket className="w-10 h-10 text-primary" />}
            />
            <FeatureCard 
              title="TypeScript Powered" 
              description="Full type safety to catch errors before they happen."
              icon={<Code className="w-10 h-10 text-primary" />}
            />
          </div>
        </div>
      </section>
    )
  }
  
  function FeatureCard({ title, description, icon }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 border hover:border-primary rounded-lg transition-all">
        {icon}
        <h3 className="font-bold text-xl">{title}</h3>
        <p className="text-muted-foreground text-center">{description}</p>
      </div>
    )
  }