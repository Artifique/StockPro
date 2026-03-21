"use client";

import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-muted text-muted-foreground",
    success:
      "bg-stockpro-stock-ok-bg text-stockpro-stock-ok-fg dark:bg-stockpro-stock-ok-fg/15 dark:text-stockpro-stock-ok-fg",
    warning:
      "bg-stockpro-stock-low-bg text-stockpro-stock-low-fg dark:bg-stockpro-stock-low-fg/15 dark:text-stockpro-stock-low-fg",
    danger:
      "bg-stockpro-stock-error-bg text-stockpro-stock-error-fg dark:bg-stockpro-stock-error-fg/15 dark:text-stockpro-stock-error-fg",
    info: "bg-stockpro-navy/10 text-stockpro-navy dark:bg-stockpro-signal/15 dark:text-stockpro-signal",
    outline: "border border-border text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
