"use client";

import { LOG_TYPES, MOCK_LOGS } from "@/data/stock-mock";

// Fonction centralisée de logging (appelée par toutes les actions)
let logIdCounter = MOCK_LOGS.length;
const logListeners: Set<(logs: typeof MOCK_LOGS) => void> = new Set();
let currentLogs: typeof MOCK_LOGS = [...MOCK_LOGS];

export const addLog = (
  type: keyof typeof LOG_TYPES,
  user: string,
  userRole: string,
  details: string,
  metadata: Record<string, unknown> = {},
  ip: string = "192.168.1.100"
) => {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  const newLog = {
    id: ++logIdCounter,
    type,
    timestamp,
    user,
    userRole,
    details,
    ip,
    metadata
  };

  currentLogs = [newLog, ...currentLogs];
  logListeners.forEach(listener => listener([...currentLogs]));


  return newLog;
};

// Helper pour logger avec l'utilisateur actuel
export const addLogWithCurrentUser = (
  type: keyof typeof LOG_TYPES,
  details: string,
  metadata: Record<string, unknown> = {}
) => {
  try {
    const savedUser = localStorage.getItem("stockpro_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      addLog(type, user.nom, user.role, details, metadata);
    } else {
      addLog(type, "Système", "Système", details, metadata);
    }
  } catch {
    addLog(type, "Système", "Système", details, metadata);
  }
};

export const getLogs = () => [...currentLogs];
export const subscribeToLogs = (listener: (logs: typeof MOCK_LOGS) => void) => {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
};
