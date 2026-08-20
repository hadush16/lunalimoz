"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setProgress(0);
    setIsVisible(true);

    const startTime = Date.now();
    const duration = 800;
    const targetProgress = 65;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * targetProgress, targetProgress);
      setProgress(progressPercent);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (progress >= 60) {
      setProgress(100);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent">
      <div
        className="h-full bg-gold transition-all duration-300 ease-out shadow-[0_0_8px_theme(colors.gold)]"
        style={{
          width: `${progress}%`,
          transition: progress >= 100 ? "width 300ms ease-out, opacity 300ms ease-out" : "none",
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
