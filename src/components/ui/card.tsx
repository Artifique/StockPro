"use client";

import React from "react";
import { motion } from "framer-motion";

type CardPadding = "none" | "sm" | "md" | "lg";

export function Card(props: {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  animate?: boolean;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  onClick?: () => void;
}) {
  const {
    children,
    className = "",
    padding = "md",
    animate = false,
    title,
    description,
    headerAction,
    onClick,
  } = props;

  const paddings: Record<CardPadding, string> = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const content = (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={
        "rounded-xl border border-border bg-card shadow-sm " +
        paddings[padding] +
        " " +
        className
      }
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {headerAction && <div className="ml-4">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
