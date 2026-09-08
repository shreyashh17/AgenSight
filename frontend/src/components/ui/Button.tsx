"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C35F7]/30 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      // Primary: Solid Nebula Purple #6C35F7 with Starry White text and crisp contrast
      primary: "bg-[#6C35F7] text-white hover:bg-[#5922E2] active:bg-[#4E1BD0] border border-[#6C35F7] shadow-sm shadow-[#6C35F7]/20 hover:shadow-[#6C35F7]/30",
      // Secondary: Deep Space Black surface with Galactic Gray subtle border
      secondary: "bg-[#1A1C22] text-[#D9D9D9] hover:text-white hover:bg-[#242730] border border-[rgba(217,217,217,0.18)] hover:border-white/20",
      // Outline: Transparent with Galactic Gray border and subtle Nebula Purple accent on hover
      outline: "bg-transparent border border-[rgba(217,217,217,0.2)] text-[#D9D9D9] hover:border-[#6C35F7] hover:text-white hover:bg-[#6C35F7]/5",
      // Ghost: Borderless, minimal
      ghost: "bg-transparent text-[#C0C0C0] hover:text-white hover:bg-[rgba(217,217,217,0.06)]",
      // Danger
      danger: "bg-[#2A171C] text-[#F87171] border border-[#F87171]/25 hover:bg-[#381B22]",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 font-medium",
      md: "text-xs md:text-sm px-3.5 py-2 gap-2 font-medium",
      lg: "text-sm px-4 py-2.5 gap-2.5 font-semibold",
      icon: "p-2 aspect-square",
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.015 }}
        whileTap={isDisabled ? undefined : { scale: 0.975 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

