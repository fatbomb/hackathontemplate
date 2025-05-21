'use client'
import { motion } from "@/lib/motion"
import { useInView } from "react-intersection-observer";

const StatsSection = () => {
  const stats = [
    { value: "10K+", label: "Active Students" },
    { value: "1000+", label: "Interactive Lessons" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "200+", label: "Virtual Experiments" },
  ];

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="bg-primary py-16 w- w-full text-primary-foreground">
      <div className="px-4 md:px-6 container">
        <div className="gap-8 grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <div className="mb-1 font-bold text-4xl">{stat.value}</div>
                <div className="font-medium text-primary-foreground/80 text-sm">{stat.label}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;