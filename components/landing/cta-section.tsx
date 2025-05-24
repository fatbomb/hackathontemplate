// components/landing/cta-section.tsx
'use client'
import Link from "next/link"
// import { Button } from "@/components/ui/button"
import { motion } from "@/lib/motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"
// import { useTheme } from "next-themes"

export const CTASection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  
  // const { resolvedTheme } = useTheme()
  // const isDark = resolvedTheme === "dark"

  return (
    <section ref={ref} className="bg-primary/5 py-12 sm:py-16 md:py-24 w-full">
      <div className="px-4 md:px-6 container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className={cn(
            "relative overflow-hidden rounded-xl p-8 md:p-12",
            "bg-gradient-to-r from-primary/90 to-purple-600/90 backdrop-blur-sm",
            "dark:from-primary/80 dark:to-purple-800/80 dark:border dark:border-primary/20"
          )}
        >
          {/* Background patterns and effects */}
          <div className="absolute inset-0 bg-grid-white/10 opacity-20 dark:opacity-10"></div>
          
          {/* Animated blobs */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="-right-12 -bottom-12 absolute bg-white/10 dark:bg-white/5 blur-2xl rounded-full w-64 h-64"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="-top-12 -left-12 absolute bg-white/10 dark:bg-white/5 blur-2xl rounded-full w-64 h-64"
          />
          
          {/* Dynamic particle effect */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  x: Math.random() * 100 - 50, 
                  y: Math.random() * 100 - 50 
                }}
                animate={inView ? { 
                  opacity: [0, 0.5, 0],
                  scale: [0, 1, 0],
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                } : {}}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute bg-white/30 dark:bg-white/20 blur-sm rounded-full w-2 h-2"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="z-10 relative mx-auto max-w-lg text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-white/10 mb-4 px-3 py-1 rounded-full font-medium text-white text-xs"
            >
              <Sparkles className="w-3 h-3" />
              Limited time offer
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4 font-bold text-white dark:text-white text-2xl sm:text-3xl tracking-tight"
            >
              Ready to Transform Your 
              <span className="relative ml-2">
                Learning
                <motion.span 
                  className="-bottom-1 left-0 absolute bg-white/70 dark:bg-white/70 rounded-full w-full h-0.5"
                  initial={{ width: 0 }}
                  animate={inView ? { width: "100%" } : {}}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span> Experience?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="opacity-90 mb-6 text-white/90 dark:text-white/80 text-sm sm:text-base"
            >
              Join thousands of students who are discovering the joy of learning science
              with our interactive platform. Start your journey today!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex sm:flex-row flex-col justify-center gap-3 sm:gap-4"
            >
              <Link 
                href="/dashboard" 
                className={cn(
                  "group relative inline-flex justify-center items-center overflow-hidden",
                  "bg-white dark:bg-white hover:bg-white/90 dark:hover:bg-white/90 shadow-lg",
                  "px-6 sm:px-8 rounded-md focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-white/50 h-11 sm:h-12 font-medium",
                  "text-sm transition-all duration-300 text-black",
                  "w-full sm:w-auto"
                )}
              >
                <span className="z-10 relative flex items-center">
                  Get Started for Free
                  <motion.span
                    className="inline-flex ml-2"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-full duration-700" />
              </Link>
              
              <Link 
                href="/pricing" 
                className={cn(
                  "inline-flex justify-center items-center",
                  "bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20",
                  "shadow-sm backdrop-blur-sm px-6 sm:px-8 border border-white/20",
                  "rounded-md h-11 sm:h-12 font-medium text-white text-sm",
                  "transition-colors w-full sm:w-auto"
                )}
              >
                View Pricing
              </Link>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex justify-center items-center gap-2 mt-6 text-white/60 dark:text-white/60 text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure payments · 30-day money back guarantee · Instant access
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}