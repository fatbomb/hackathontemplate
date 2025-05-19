// components/landing/testimonial-section.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialSection() {
  return (
    <section className="bg-muted/40 py-20 w-full">
      <div className="px-4 md:px-6 container">
        <div className="flex flex-col justify-center items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-bold text-3xl sm:text-5xl tracking-tighter">Trusted by Developers</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Don't just take our word for it. See what others have built with our starter kit.
            </p>
          </div>
        </div>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto py-12">
          <TestimonialCard 
            quote="This starter kit saved me days of setup time for my hackathon project. Highly recommended!"
            name="Alex Johnson"
            title="Frontend Developer"
            avatar="/avatars/avatar-1.png"
          />
          <TestimonialCard 
            quote="The components are beautifully designed and the documentation is excellent. A game changer."
            name="Sarah Chen"
            title="UX Designer"
            avatar="/avatars/avatar-2.png"
          />
          <TestimonialCard 
            quote="I was able to launch my MVP in a weekend thanks to this toolkit. The authentication flow just works."
            name="Miguel Rodriguez"
            title="Startup Founder"
            avatar="/avatars/avatar-3.png"
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, name, title, avatar }: { 
  quote: string; 
  name: string; 
  title: string; 
  avatar: string;
}) {
  return (
    <Card className="text-left">
      <CardContent className="space-y-4 p-6">
        <p className="text-muted-foreground italic">"{quote}"</p>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-muted-foreground text-sm">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}