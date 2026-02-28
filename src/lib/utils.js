import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes.
 * It combines clsx for conditional class names and tailwind-merge to resolve conflicts.
 *
 * @param inputs - Class names or conditional class objects.
 * @returns A merged class name string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
