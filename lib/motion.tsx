"use client";

// Import specific components instead of using export *
import { 
  motion as m,
  AnimatePresence as AP,
  useAnimate as uAnimate,
  useAnimation as uAnimation,
  useInView as uInView,
  useScroll as uScroll,
  useTransform as uTransform,
  useSpring as uSpring,
  useDragControls as uDragControls,
  useMotionValue as uMotionValue,
  useMotionTemplate as uMotionTemplate,
  Variants as V,
  Transition as T,
  MotionConfig as MC
} from "framer-motion";

// Re-export with proper named exports
export const motion = m;
export const AnimatePresence = AP;
export const useAnimate = uAnimate;
export const useAnimation = uAnimation;
export const useInView = uInView;
export const useScroll = uScroll;
export const useTransform = uTransform;
export const useSpring = uSpring;
export const useDragControls = uDragControls;
export const useMotionValue = uMotionValue;
export const useMotionTemplate = uMotionTemplate;
// Variants is a type, so export it as a type only
export type Variants = V;
export type Transition = T;
export const MotionConfig = MC;

// Helper types and variants
export type MotionVariants = V;
export type MotionTransition = T;

// Add commonly used variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const slideDown = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const staggerChildren = (staggerTime = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerTime
    }
  }
});