import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-800",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rect" && "rounded-none",
        className
      )}
    />
  );
}
