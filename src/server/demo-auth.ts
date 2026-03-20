import "server-only";

import { MOCK_USERS, type StockProUser } from "@/data/stock-mock";

/** Mots de passe démo : ce module ne doit être importé que par des Route Handlers / Server Actions. */
const DEMO_PASSWORDS_BY_USER_ID: Record<number, string> = {
  1: "Admin123!",
  2: "Gerant123!",
  3: "Caisse123!",
  4: "Stock123!",
  5: "Compta123!",
};

export function verifyDemoPassword(email: string, password: string): StockProUser | null {
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;
  const expected = DEMO_PASSWORDS_BY_USER_ID[user.id];
  if (!expected || expected !== password) return null;
  return user;
}

export function getDemoUserById(id: number): StockProUser | null {
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}
