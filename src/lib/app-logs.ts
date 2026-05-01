export const LOG_TYPES = {
  STOCK: "Stock",
  AUTH: "Authentification",
  SALE: "Vente",
  PURCHASE: "Achat",
  SYSTEM: "Système",
  LOGIN: "Connexion"
} as const;

export interface AppLog {
  id: number;
  type: keyof typeof LOG_TYPES;
  timestamp: string;
  user: string;
  userRole: string;
  details: string;
  ip: string;
  metadata: Record<string, unknown>;
}

// Fonction centralisée de logging (appelée par toutes les actions)
let logIdCounter = 0;
const logListeners: Set<(logs: AppLog[]) => void> = new Set();
let currentLogs: AppLog[] = [];

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
export const subscribeToLogs = (listener: (logs: AppLog[]) => void) => {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
};
