"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;
const toastListeners: Set<(toasts: Toast[]) => void> = new Set();
const toastTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();
let currentToasts: Toast[] = [];

function dismissToast(id: number) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  toastListeners.forEach((listener) => listener([...currentToasts]));
  const timer = toastTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(id);
  }
}

export function showToast(message: string, type: ToastType = "info", duration: number = 0) {
  const id = ++toastId;

  if (duration === 0) {
    switch (type) {
      case "success":
        duration = 4000;
        break;
      case "error":
        duration = 6000;
        break;
      case "warning":
        duration = 5000;
        break;
      case "info":
      default:
        duration = 4000;
        break;
    }
  }

  const existingTimer = toastTimers.get(id);
  if (existingTimer) {
    clearTimeout(existingTimer);
    toastTimers.delete(id);
  }

  currentToasts = [...currentToasts, { id, message, type, duration }];
  toastListeners.forEach((listener) => listener([...currentToasts]));

  if (duration > 0) {
    const timer = setTimeout(() => {
      dismissToast(id);
    }, duration);
    toastTimers.set(id, timer);
  }
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.add(setToasts);
    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);

  const typeGradientStyles: Record<ToastType, string> = {
    success: "from-emerald-400 to-emerald-600",
    error: "from-rose-400 to-rose-600",
    warning: "from-amber-400 to-amber-600",
    info: "from-sky-400 to-sky-600",
  };

  const typeProgressColors: Record<ToastType, string> = {
    success: "bg-emerald-200",
    error: "bg-rose-200",
    warning: "bg-amber-200",
    info: "bg-sky-200",
  };

  const typeIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.2 } }}
            layout
            className={`pointer-events-auto relative overflow-hidden rounded-xl shadow-2xl bg-gradient-to-r ${typeGradientStyles[toast.type]} text-white`}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
              >
                {typeIcons[toast.type]}
              </motion.div>
              <span className="font-medium text-sm flex-1">{toast.message}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => dismissToast(toast.id)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 ${typeProgressColors[toast.type]} origin-left`}
              style={{ width: "100%" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
