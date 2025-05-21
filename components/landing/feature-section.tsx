'use client'
// components/landing/feature-section.tsx
import { motion } from "@/lib/motion"
import { 
    Zap, Shield, RefreshCw, Layers, 
    Smartphone, PaintBucket, Code, Maximize, 
    Beaker,
    GraduationCap,
    Trophy,
    Users,
    Play
  } from "lucide-react"
import { useInView } from "react-intersection-observer";
  
  const FeatureSection = () => {
  const features = [
    {
      title: "Interactive 3D Models",
      description: "Manipulate molecular structures, explore anatomical systems, and interact with physical phenomena in three dimensions.",
      icon: <motion.div 
        animate={{ 
          rotateY: [0, 360],
        }}
        transition={{ 
          duration: 8, 
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex justify-center items-center bg-primary/10 rounded-lg w-12 h-12"
      >
        <div className="bg-primary/20 rounded-md w-8 h-8" />
      </motion.div>,
    },
    {
      title: "Virtual Experiments",
      description: "Conduct laboratory experiments virtually with real-time feedback and data analysis tools.",
      icon: <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
        }}
        className="flex justify-center items-center bg-primary/10 rounded-lg w-12 h-12"
      >
        <Beaker className="w-6 h-6 text-primary" />
      </motion.div>,
    },
    {
      title: "Personalized Learning Paths",
      description: "AI-powered recommendations adapt to your learning style and pace for optimized educational outcomes.",
      icon: <motion.div 
        animate={{ 
          y: [0, -5, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
        }}
        className="flex justify-center items-center bg-primary/10 rounded-lg w-12 h-12"
      >
        <GraduationCap className="w-6 h-6 text-primary" />
      </motion.div>,
    },
    {
      title: "Progress Tracking",
      description: "Monitor your mastery of concepts with detailed analytics and achievement badges.",
      icon: <motion.div 
        animate={{ 
          rotate: [0, 10, -10, 0],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
        }}
        className="flex justify-center items-center bg-primary/10 rounded-lg w-12 h-12"
      >
        <Trophy className="w-6 h-6 text-primary" />
      </motion.div>,
    },
    {
      title: "Collaborative Learning",
      description: "Join study groups, participate in discussions, and solve problems with peers from around the world.",
      icon: <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 3.5, 
          repeat: Infinity,
        }}
        className="flex justify-center items-center bg-primary/10 rounded-lg w-12 h-12"
      >
        <Users className="w-6 h-6 text-primary" />
      </motion.div>,
    },
    {
      title: "Expert-Led Video Lessons",
      description: "Learn from top educators with captivating video presentations on complex scientific concepts.",
      icon: <motion.div 
        animate={{ 
          borderRadius: ["20%", "50%", "20%"],
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
        }}
        className="flex justify-center items-center bg-primary/10 rounded-lg w-12 h-12"
      >
        <Play className="w-6 h-6 text-primary" />
      </motion.div>,
    },
  ];

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="bg-gray-50 dark:bg-slate-900 py-16 md:py-24">
      <div className="px-4 md:px-6 container">
        <div className="mb-12 text-center">
          <h2 className="mb-2 font-bold text-3xl tracking-tight">
            Features That Make Learning Science Fun
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Our platform combines cutting-edge technology with proven educational methods
            to create an engaging learning experience.
          </p>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card shadow-sm hover:shadow-md p-6 border rounded-xl transition-all duration-200"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="mb-2 font-bold text-xl">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeatureSection;
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