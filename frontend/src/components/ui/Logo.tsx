"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "mark" | "stacked";
}

export function Logo({ className, collapsed = false, size = "md", variant = "horizontal" }: LogoProps) {
  if (collapsed) {
    return (
      <Link href="/" className={cn("flex items-center justify-center select-none group py-1", className)}>
        <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 transition-transform group-hover:scale-105">
          <Image
            src="/logo-mark.png"
            alt="AgentSight Symbol"
            width={32}
            height={32}
            className="object-contain w-full h-full"
            priority
            unoptimized
          />
        </div>
      </Link>
    );
  }

  const heights = {
    sm: "h-6",
    md: "h-7",
    lg: "h-9",
  };

  return (
    <Link href="/" className={cn("flex items-center select-none group py-1", className)}>
      <div className={cn("relative flex items-center transition-opacity group-hover:opacity-95", heights[size])}>
        {/* Official Full Horizontal AgentSight Brand Logo (Mark + Typography with Purple Gradient) */}
        <Image
          src="/logo-horizontal.png"
          alt="AgentSight Logo"
          width={160}
          height={32}
          className="object-contain h-full w-auto"
          priority
          unoptimized
        />
      </div>
    </Link>
  );
}
