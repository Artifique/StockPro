"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useDisclosure } from "@/hooks/use-disclosure";
import { showToast } from "@/lib/app-toast";

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const offlineBanner = useDisclosure();

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsOnline(navigator.onLine);
    });

    const handleOnline = () => {
      setIsOnline(true);
      offlineBanner.close();
      showToast("Connexion rétablie", "success");
    };

    const handleOffline = () => {
      setIsOnline(false);
      offlineBanner.open();
      showToast("Vous êtes hors ligne", "warning", 0);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineBanner]);

  return (
    <AnimatePresence>
      {!isOnline && offlineBanner.isOpen && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-stockpro-stock-low-fg text-white py-2 px-4 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Vous êtes hors ligne - Les modifications seront synchronisées à la reconnexion</span>
            <button
              type="button"
              onClick={() => offlineBanner.close()}
              className="ml-4 rounded p-1 hover:bg-stockpro-stock-low-fg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
