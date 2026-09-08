import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(3)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}
