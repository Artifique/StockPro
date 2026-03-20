import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const ex = path.join(root, "scripts", "_extracted");

function read(name) {
  return fs.readFileSync(path.join(ex, `${name}.tsx.txt`), "utf8");
}

function write(rel, body) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body, "utf8");
  console.log(rel);
}

const PAGE_IMPORTS = `"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
  Truck,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  LogOut,
  User,
  Key,
  RefreshCw,
  Send,
  Phone,
  Building,
  CreditCard,
  Wallet,
  Star,
  AlertCircle,
  Info,
  Check,
  Minus,
  HelpCircle,
  Printer,
  MapPin,
  Zap,
  Smartphone,
  Heart,
  History,
  Database,
  Copy,
  Lightbulb,
  Play,
  Book,
  Home,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ACTIVITES_RECENTES,
  CATEGORIES,
  LOG_CATEGORIES,
  LOG_TYPES,
  MOCK_CLIENTS,
  MOCK_COMMANDES,
  MOCK_FACTURES,
  MOCK_FOURNISSEURS,
  MOCK_LOGS,
  MOCK_MOUVEMENTS,
  MOCK_PRODUCTS,
  MOCK_RETOURS,
  MOCK_TRANSACTIONS,
  MOCK_USERS,
  MOTIFS_RETOUR,
  REPARTITION_CA,
  SEVERITY_STYLES,
  STATUTS_RETOUR,
  STOCK_EVOLUTION,
  TOP_PRODUITS,
  UNITES_MESURE,
  VENTES_MENSUELLES,
} from "@/data/stock-mock";
import { addLog, addLogWithCurrentUser, getLogs, subscribeToLogs } from "@/lib/app-logs";
import { downloadCsvFile } from "@/lib/export-csv";
import { formatCurrency, formatShortCurrency } from "@/lib/format";
import { loadJsPdf, loadJsPdfWithAutoTable } from "@/lib/pdf";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast, ToastContainer } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Skeleton, PageTransition, Alert, Select, ConfirmDialog, Avatar } from "@/components/stock-pro/primitives";

`;

let prim = read("primitives");
prim = prim
  .replace(/^const Skeleton:/m, "export const Skeleton:")
  .replace(/^const PageTransition:/m, "export const PageTransition:")
  .replace(/^const NotificationPanel:/m, "export const NotificationPanel:")
  .replace(/^const Alert:/m, "export const Alert:")
  .replace(/^const Select:/m, "export const Select:")
  .replace(/^const ConfirmDialog:/m, "export const ConfirmDialog:")
  .replace(/^const Avatar:/m, "export const Avatar:");

const PRIM_HEADER = `"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Bell,
  TrendingUp,
  TrendingDown,
  Filter,
  Trash2,
} from "lucide-react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Button, Card } from "@/components/ui";
import { showToast } from "@/lib/app-toast";

`;

write("src/components/stock-pro/primitives.tsx", PRIM_HEADER + prim);

const pages = [
  ["loginPage", "src/features/auth/login-page.tsx", ""],
  ["dashboardPage", "src/features/dashboard/dashboard-page.tsx", read("kpICard") + "\n\n"],
  ["produitsPage", "src/features/produits/produits-page.tsx", ""],
  ["clientsPage", "src/features/clients/clients-page.tsx", ""],
  ["rapportsPage", "src/features/rapports/rapports-page.tsx", ""],
  ["parametresPage", "src/features/parametres/parametres-page.tsx", ""],
  ["posPage", "src/features/pos/pos-page.tsx", ""],
  ["stockPage", "src/features/stock/stock-page.tsx", ""],
  ["fournisseursPage", "src/features/fournisseurs/fournisseurs-page.tsx", ""],
  ["achatsPage", "src/features/achats/achats-page.tsx", ""],
  ["facturationPage", "src/features/facturation/facturation-page.tsx", ""],
  ["retoursPage", "src/features/retours/retours-page.tsx", ""],
  ["profilePage", "src/features/profile/profile-page.tsx", ""],
];

for (const [key, dest, prefix] of pages) {
  let body = read(key);
  if (/^const \w+Page:/m.test(body)) {
    body = body.replace(/^const (\w+Page):/m, "export const $1:");
  }
  write(dest, PAGE_IMPORTS + prefix + body);
}

console.log("build-stock-pro-modules done");
