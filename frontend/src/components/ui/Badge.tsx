"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "purple" | "neutral" | "silver" | "success" | "blue" | "warning";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "purple",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded transition-colors";

  const variants = {
    purple: "bg-[#6C35F7]/12 text-[#A78BFA] border border-[#6C35F7]/30",
    neutral: "bg-[rgba(217,217,217,0.06)] text-[#D9D9D9] border border-[rgba(217,217,217,0.15)]",
    silver: "bg-[rgba(192,192,192,0.08)] text-[#C0C0C0] border border-[rgba(192,192,192,0.2)]",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    blue: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1 font-mono-code leading-none",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
