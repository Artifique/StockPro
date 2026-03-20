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
        "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 " +
        paddings[padding] +
        " " +
        className
      }
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>}
            {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
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
