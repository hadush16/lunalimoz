"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationVariant = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale" | "reveal";

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
  viewportOnce?: boolean;
}

const variantsMap: Record<AnimationVariant, { hidden: any; visible: any }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
  reveal: {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
};

export function AnimatedSection({
  variant = "fadeUp",
  delay = 0,
  duration = 0.5,
  className,
  children,
  viewportOnce = true,
  ...props
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const selectedVariant = variantsMap[variant] || variantsMap.fadeUp;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: "-40px" }}
      variants={selectedVariant}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedStaggerContainer({
  className,
  children,
  staggerInterval = 0.1,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  staggerInterval?: number;
} & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerInterval,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedStaggerItem({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
