"use client"; // Ensure this is at the top
import { motion } from "@/lib/motion"
import { Atom, Beaker, Brain, Calculator } from "lucide-react";
import { useState } from "react";

const ScienceAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative p-6 pt-0 w-full h-full" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="gap-4 grid grid-cols-2 h-full">
        <motion.div 
          className="group relative flex flex-col justify-center items-center bg-background/50 p-4 rounded-lg overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Atom className="mb-2 w-8 h-8 text-blue-500" />
          <span className="font-medium text-sm">Physics</span>
          <motion.div 
            className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="-right-12 -bottom-12 absolute bg-blue-500/20 rounded-full w-24 h-24"
            animate={isHovered ? { 
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
        </motion.div>

        <motion.div 
          className="group relative flex flex-col justify-center items-center bg-background/50 p-4 rounded-lg overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Beaker className="mb-2 w-8 h-8 text-green-500" />
          <span className="font-medium text-sm">Chemistry</span>
          <motion.div 
            className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="-top-12 -left-12 absolute bg-green-500/20 rounded-full w-24 h-24"
            animate={isHovered ? { 
              y: [0, 40, 0],
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
        </motion.div>

        <motion.div 
          className="group relative flex flex-col justify-center items-center bg-background/50 p-4 rounded-lg overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Calculator className="mb-2 w-8 h-8 text-purple-500" />
          <span className="font-medium text-sm">Math</span>
          <motion.div 
            className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="-top-12 -right-12 absolute bg-purple-500/20 rounded-full w-24 h-24"
            animate={isHovered ? { 
              x: [0, -40, 0],
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
        </motion.div>

        <motion.div 
          className="group relative flex flex-col justify-center items-center bg-background/50 p-4 rounded-lg overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Brain className="mb-2 w-8 h-8 text-red-500" />
          <span className="font-medium text-sm">Biology</span>
          <motion.div 
            className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="-bottom-12 -left-12 absolute bg-red-500/20 rounded-full w-24 h-24"
            animate={isHovered ? { 
              x: [0, 40, 0],
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ScienceAnimation;