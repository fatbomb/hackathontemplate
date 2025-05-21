'use client'
import { useInView } from "react-intersection-observer";
import { ArrowRight, Atom, Beaker, Brain, Calculator } from "lucide-react";
import { motion } from "@/lib/motion"
import Link from "next/link";

const SubjectsSection = () => {
  const subjects = [
    {
      title: "Physics",
      icon: <Atom className="w-12 h-12 text-blue-500" />,
      description: "Explore mechanics, electricity, magnetism, and quantum physics through interactive simulations and experiments.",
      color: "bg-blue-500",
      hoverColor: "group-hover:bg-blue-600",
      textColor: "text-blue-500"
    },
    {
      title: "Chemistry",
      icon: <Beaker className="w-12 h-12 text-green-500" />,
      description: "Discover chemical reactions, periodic trends, and molecular structures with 3D models and virtual labs.",
      color: "bg-green-500",
      hoverColor: "group-hover:bg-green-600",
      textColor: "text-green-500"
    },
    {
      title: "Mathematics",
      icon: <Calculator className="w-12 h-12 text-purple-500" />,
      description: "Master algebra, calculus, statistics, and geometry with step-by-step visualizations and problem-solving tools.",
      color: "bg-purple-500",
      hoverColor: "group-hover:bg-purple-600",
      textColor: "text-purple-500"
    },
    {
      title: "Biology",
      icon: <Brain className="w-12 h-12 text-red-500" />,
      description: "Understand cells, genetics, ecosystems, and human anatomy through detailed visualizations and virtual dissections.",
      color: "bg-red-500",
      hoverColor: "group-hover:bg-red-600",
      textColor: "text-red-500"
    }
  ];

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="bg-background py-16 md:py-24">
      <div className="px-4 md:px-6 container">
        <div className="mb-12 text-center">
          <h2 className="mb-2 font-bold text-3xl tracking-tight">Explore Our Subjects</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Dive into our comprehensive curriculum designed to make complex scientific concepts accessible and engaging.
          </p>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card shadow-sm hover:shadow-md p-6 border rounded-xl overflow-hidden transition-all duration-200"
            >
              <div className="-right-12 -bottom-12 absolute opacity-10 group-hover:opacity-20 rounded-full w-48 h-48 transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${subject.color.replace('bg-', '')} 0%, transparent 70%)` }}></div>
              
              <div className="z-10 relative">
                <div className="mb-4">{subject.icon}</div>
                <h3 className="mb-2 font-bold text-xl">{subject.title}</h3>
                <p className="mb-4 text-muted-foreground text-sm">{subject.description}</p>
                <Link 
                  href={`/subjects/${subject.title.toLowerCase()}`}
                  className={`inline-flex items-center text-sm font-medium ${subject.textColor}`}
                >
                  Explore {subject.title}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
