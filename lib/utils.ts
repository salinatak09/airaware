import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes with clsx and twMerge to handle class conflicts safely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
