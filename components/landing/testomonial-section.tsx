'use client'
// components/landing/testimonial-section.tsx
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { useInView } from "react-intersection-observer";

const TestimonialSection = () => {
  const testimonials = [
    {
      quote: "The interactive 3D models completely changed how I understand molecular structures. Chemistry finally makes sense!",
      author: "Emma L.",
      role: "High School Student",
      avatar: "/api/placeholder/30/30",
    },
    {
      quote: "As a teacher, I've seen my students' engagement skyrocket since incorporating FlameKeepers into our curriculum.",
      author: "Dr. Michael Chan",
      role: "Science Educator",
      avatar: "/api/placeholder/30/30",
    },
    {
      quote: "The personalized learning paths helped me prepare for my college entrance exams with confidence. I aced physics!",
      author: "Aiden T.",
      role: "College Freshman",
      avatar: "/api/placeholder/30/30",
    },
  ];

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="bg-background py-16 md:py-24">
      <div className="px-4 md:px-6 container">
        <div className="mb-12 text-center">
          <h2 className="mb-2 font-bold text-3xl tracking-tight">
            What Our Students Say
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join thousands of satisfied learners who&apos;ve transformed their understanding of science.
          </p>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-card shadow-sm p-6 border rounded-xl"
            >
              <div className="relative">
                <span className="-top-2 -left-2 absolute opacity-20 text-primary text-4xl">&quot;</span>
                <p className="z-10 relative mb-4 text-muted-foreground italic">
                  {testimonial.quote}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full w-8 h-8 overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-muted-foreground text-xs">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TestimonialSection;
// function TestimonialCard({ quote, name, title, avatar }: { 
//   quote: string; 
//   name: string; 
//   title: string; 
//   avatar: string;
// }) {
//   return (
//     <Card className="text-left">
//       <CardContent className="space-y-4 p-6">
//         <p className="text-muted-foreground italic">"{quote}"</p>
//         <div className="flex items-center space-x-4">
//           <Avatar>
//             <AvatarImage src={avatar} alt={name} />
//             <AvatarFallback>{name.charAt(0)}</AvatarFallback>
//           </Avatar>
//           <div>
//             <p className="font-semibold">{name}</p>
//             <p className="text-muted-foreground text-sm">{title}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }