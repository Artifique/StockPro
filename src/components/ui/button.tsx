"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    loading = false,
    type = "button",
    ...rest
  } = props;

  const variantClass =
    variant === "primary"
      ? "bg-stockpro-navy text-white hover:bg-stockpro-navy-hover focus:ring-stockpro-signal dark:bg-stockpro-signal dark:text-stockpro-navy-night dark:hover:brightness-110"
      : variant === "secondary"
        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-stockpro-signal"
        : variant === "ghost"
          ? "text-muted-foreground hover:bg-muted focus:ring-stockpro-signal"
          : variant === "danger"
            ? "bg-stockpro-stock-error-fg text-white hover:opacity-90 focus:ring-stockpro-stock-error-fg"
            : variant === "success"
              ? "bg-stockpro-signal text-stockpro-navy-night hover:brightness-95 focus:ring-stockpro-signal"
              : "border border-border bg-card text-foreground hover:bg-muted focus:ring-stockpro-signal";

  const sizeClass = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";

  return (
    <button
      type={type}
      className={
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed " +
        variantClass +
        " " +
        sizeClass +
        " " +
        className
      }
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
