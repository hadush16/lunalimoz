import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card border border-border",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-4 text-gold">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-black italic uppercase text-foreground mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-md">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onAction}
            className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-md"
          >
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
