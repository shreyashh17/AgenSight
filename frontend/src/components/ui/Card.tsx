"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  elevated?: boolean;
  interactive?: boolean;
}

export function Card({ className, elevated = false, interactive = false, children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "surface-card p-5 md:p-6 relative overflow-hidden",
        elevated && "surface-card-elevated border-[rgba(217,217,217,0.18)] shadow-md",
        interactive && "interactive-card cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

