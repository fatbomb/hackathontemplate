'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "@/lib/motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import ScienceAnimation from "./scienceAnimation"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative flex flex-col items-center bg-gradient-to-b from-primary/5 via-background/95 to-background pt-6 sm:pt-10 md:pt-20 pb-12 md:pb-16 w-full min-h-[90vh] md:min-h-[85vh] overflow-hidden">
      {/* Dynamic background with parallax effect */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-5"
        style={{
          transform: `translate(${mousePosition.x / 100}px, ${mousePosition.y / 100}px)`,
          transition: "transform 0.2s ease-out"
        }}
      />
      
      {/* Animated gradient blobs - adjusted position for mobile */}
      <div className="-top-20 sm:-top-40 -left-20 sm:-left-40 absolute bg-primary/20 opacity-30 blur-3xl rounded-full w-60 sm:w-80 h-60 sm:h-80 animate-blob filter" />
      <div className="top-20 sm:top-0 right-0 sm:-right-20 absolute bg-purple-600/20 opacity-30 blur-3xl rounded-full w-60 sm:w-80 h-60 sm:h-80 animate-blob animation-delay-2000 filter" />
      <div className="bottom-20 sm:bottom-40 left-10 sm:left-20 absolute bg-cyan-400/20 opacity-30 blur-3xl rounded-full w-60 sm:w-80 h-60 sm:h-80 animate-blob animation-delay-4000 filter" />

      <div className="z-10 relative px-4 md:px-6 container">
        <div className="items-center gap-8 md:gap-12 grid grid-cols-1 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 sm:gap-6 lg:col-span-6 pt-4 sm:pt-8 md:pt-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-full max-w-fit font-medium text-primary text-xs sm:text-sm"
            >
              <span className="relative flex w-2 h-2">
                <span className="inline-flex absolute bg-primary opacity-75 rounded-full w-full h-full animate-ping"></span>
                <span className="inline-flex relative bg-primary rounded-full w-2 h-2"></span>
              </span>
              <Sparkles className="mr-1 w-3 sm:w-4 h-3 sm:h-4" />
              <span className="truncate">Reimagine Science Education</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={isLoaded ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight"
            >
              Make Science{" "}
              <AnimatePresence>
                <motion.span
                  key="fun"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="inline-block relative text-primary"
                >
                  Fun
                  <motion.span 
                    className="-bottom-1 left-0 absolute bg-primary rounded-full w-full h-1"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  />
                </motion.span>
              </AnimatePresence>
              {" "}and{" "}
              <br className="hidden sm:inline" /> 
              <motion.span
                initial={{ opacity: 0 }}
                animate={isLoaded ? { opacity: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="inline-block bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-cyan-400 text-transparent"
              >
                Unforgettable
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isLoaded ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="max-w-lg text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed"
            >
              Interactive lessons, stunning visualizations, and hands-on experiments
              that make physics, chemistry, math, and biology come alive for the
              next generation of innovators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex xs:flex-row sm:flex-row flex-col gap-3 sm:gap-4 mt-2"
            >
              <Link 
                href="/dashboard" 
                className={cn(
                  "group relative inline-flex justify-center items-center overflow-hidden",
                  "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20",
                  "px-6 sm:px-8 rounded-md focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring h-12 sm:h-14 font-medium text-primary-foreground",
                  "text-sm transition-all duration-300 w-full xs:w-auto"
                )}
              >
                <span className="z-10 relative flex items-center">
                  Start Learning Now
                  <motion.span
                    className="inline-flex ml-2"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="/demo" 
                className="group inline-flex justify-center items-center bg-background/80 hover:bg-accent shadow-sm backdrop-blur-sm px-6 sm:px-8 border border-input rounded-md w-full xs:w-auto h-12 sm:h-14 font-medium text-sm transition-colors hover:text-accent-foreground"
              >
                Watch Demo
                <motion.span
                  className="inline-flex justify-center items-center bg-primary/10 ml-2 rounded-full w-6 h-6 text-primary"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Play className="w-3 h-3" />
                </motion.span>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={isLoaded ? { opacity: 1 } : {}}
              transition={{ delay: 1.1, duration: 0.7 }}
              className="flex items-center gap-3 mt-3 sm:mt-4 md:mt-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-accent border-2 border-background rounded-full w-6 sm:w-8 h-6 sm:h-8 overflow-hidden">
                    <div className={`w-full h-full bg-gradient-to-br from-primary/${30 + i * 10} to-purple-600/${30 + i * 10}`}></div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                <span className="font-semibold text-foreground">10,000+</span> students already learning
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative lg:col-span-6 mt-6 lg:mt-0"
          >
            <div className="relative mx-auto w-full max-w-full sm:max-w-lg md:max-w-xl aspect-[4/3] sm:aspect-square">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-purple-600/30 to-cyan-400/30 opacity-20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative bg-card/80 shadow-xl backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl h-full overflow-hidden">
                <div className="absolute inset-0 bg-grid-small-pattern opacity-5"></div>
                <div className="p-3 sm:p-6 pb-0 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-lg">Interactive Science Dashboard</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">Explore the wonders of science</p>
                    </div>
                    <div className="hidden sm:flex gap-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-muted-foreground/20 border border-muted-foreground/30 rounded-full w-2 sm:w-3 h-2 sm:h-3" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-1 w-full h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)]">
                  <ScienceAnimation />
                </div>
              </div>
              
              {/* Floating badges - hidden on smaller screens, visible on medium and up */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="hidden sm:block -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 z-10 absolute bg-card shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-green-500/20 rounded-full w-6 sm:w-8 h-6 sm:h-8">
                    <span className="font-bold text-green-500 text-xs sm:text-sm">+</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground sm:text-xs">Knowledge Growth</div>
                    <div className="font-semibold text-xs sm:text-sm">87% Increase</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="hidden sm:block -top-2 -right-2 z-10 absolute bg-card shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg"
              >
                <div className="text-[10px] text-muted-foreground sm:text-xs">Personalized Learning</div>
                <div className="font-semibold text-xs sm:text-sm">AI-Powered</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection