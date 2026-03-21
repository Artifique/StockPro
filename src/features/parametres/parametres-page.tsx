"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Boxes,
  Users,
  FileText,
  BarChart3,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  User,
  Key,
  RefreshCw,
  Send,
  Building,
  CreditCard,
  Wallet,
  AlertCircle,
  Check,
  Minus,
  MapPin,
  Smartphone,
  History,
  Database,
  Copy,
} from "lucide-react";
import {
  CATEGORIES,
  LOG_CATEGORIES,
  LOG_TYPES,
  MOCK_CLIENTS,
  MOCK_FACTURES,
  MOCK_LOGS,
  MOCK_PRODUCTS,
  MOCK_TRANSACTIONS,
  MOCK_USERS,
  SEVERITY_STYLES,
  UNITES_MESURE,
} from "@/data/stock-mock";
import { addLogWithCurrentUser, getLogs, subscribeToLogs } from "@/lib/app-logs";
import { downloadCsvFile } from "@/lib/export-csv";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import {
  STOCKPRO_WELCOME_DISMISSED_KEY,
  STOCKPRO_WELCOME_RESET_EVENT,
} from "@/lib/stockpro-storage-keys";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Alert, Select, Avatar } from "@/components/stock-pro/primitives";

export const ParametresPage: React.FC<{
  currentUser: typeof MOCK_USERS[0];
}> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState("utilisateurs");
  const [users, setUsers] = useState(MOCK_USERS);
  const newUserModal = useDisclosure();
  const editUserModal = useDisclosure();
  const resetPasswordModal = useDisclosure();
  const [resetPasswordTempPreview, setResetPasswordTempPreview] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [logStatsUseLiveDate] = useState(true);
  const [editUserData, setEditUserData] = useState({ nom: "", email: "", role: "" });

  const categoryModal = useDisclosure();
  const unitModal = useDisclosure();
  const [categories, setCategories] = useState(CATEGORIES);
  const [unites, setUnites] = useState(UNITES_MESURE);
  const [newCategory, setNewCategory] = useState({ nom: "", color: "#1a2b6d" });
  const [newUnit, setNewUnit] = useState({ nom: "", abreviation: "" });
  const [editingCategory, setEditingCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [editingUnit, setEditingUnit] = useState<typeof UNITES_MESURE[0] | null>(null);

  // Enterprise settings state
  const [enterpriseSettings, setEnterpriseSettings] = useState({
    nomEntreprise: "StockPro Mali SARL",
    email: "contact@stockpro.ml",
    telephone: "+223 70 00 00 00",
    adresse: "Bamako, ACI 2000",
    pays: "Mali",
    devise: "FCFA",
    logo: null as string | null,
  });

  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefixFacture: "FAC",
    prefixDevis: "DEV",
    prefixAvoir: "AVR",
    numeroSuivant: 2024,
    tvaDefaut: 18,
    delaiPaiement: 30,
    conditionsPaiement: "Paiement à 30 jours fin de mois",
    notesPied: "Merci de votre confiance",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    alerteStockMin: true,
    alerteRupture: true,
    alertePaiement: true,
    rappelEcheance: true,
    rapportJournalier: false,
    rapportHebdo: true,
    emailNotifications: true,
    smsNotifications: false,
    emailAdmin: "admin@stockpro.ml",
    smsPhone: "+223 70 00 00 00",
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    authentification2FA: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  });

  // Backup settings state
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    retentionDays: 30,
    lastBackup: "2024-12-15 02:00",
    nextBackup: "2024-12-16 02:00",
  });

  // Logs state
  const [logs, setLogs] = useState<typeof MOCK_LOGS>(() => getLogs());
  const [logFilterCategory, setLogFilterCategory] = useState("all");
  const [logFilterSeverity, setLogFilterSeverity] = useState("all");
  const [logFilterDate, setLogFilterDate] = useState("");
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<typeof MOCK_LOGS[0] | null>(null);
  const logDetailsModal = useDisclosure();

  // DataTables state
  const [logSortField, setLogSortField] = useState<string>("timestamp");
  const [logSortDirection, setLogSortDirection] = useState<"asc" | "desc">("desc");
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(15);

  useEffect(() => {
    const unsubscribe = subscribeToLogs((newLogs) => setLogs(newLogs));
    return unsubscribe;
  }, []);

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (logFilterCategory !== "all") {
      result = result.filter(log => LOG_TYPES[log.type as keyof typeof LOG_TYPES]?.category === logFilterCategory);
    }

    if (logFilterSeverity !== "all") {
      result = result.filter(log => LOG_TYPES[log.type as keyof typeof LOG_TYPES]?.severity === logFilterSeverity);
    }

    if (logFilterDate) {
      result = result.filter(log => log.timestamp.startsWith(logFilterDate));
    }

    if (logSearchTerm) {
      const term = logSearchTerm.toLowerCase();
      result = result.filter(log =>
        log.details.toLowerCase().includes(term) ||
        log.user.toLowerCase().includes(term) ||
        log.type.toLowerCase().includes(term)
      );
    }

    // Sorting
    result = [...result].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (logSortField) {
        case "timestamp":
          aVal = a.timestamp;
          bVal = b.timestamp;
          break;
        case "type":
          aVal = LOG_TYPES[a.type as keyof typeof LOG_TYPES]?.label || a.type;
          bVal = LOG_TYPES[b.type as keyof typeof LOG_TYPES]?.label || b.type;
          break;
        case "user":
          aVal = a.user;
          bVal = b.user;
          break;
        case "details":
          aVal = a.details;
          bVal = b.details;
          break;
        case "ip":
          aVal = a.ip;
          bVal = b.ip;
          break;
        default:
          aVal = a.timestamp;
          bVal = b.timestamp;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return logSortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return result;
  }, [logs, logFilterCategory, logFilterSeverity, logFilterDate, logSearchTerm, logSortField, logSortDirection]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * logPageSize;
    return filteredLogs.slice(start, start + logPageSize);
  }, [filteredLogs, logPage, logPageSize]);

  const totalLogPages = Math.ceil(filteredLogs.length / logPageSize);

  const logStats = useMemo(() => {
    const today = logStatsUseLiveDate ? new Date().toISOString().split("T")[0] : "";
    const todayLogs = today ? logs.filter((l) => l.timestamp.startsWith(today)) : [];
    return {
      total: logs.length,
      today: todayLogs.length,
      errors: logs.filter(l => LOG_TYPES[l.type as keyof typeof LOG_TYPES]?.severity === "danger").length,
      warnings: logs.filter(l => LOG_TYPES[l.type as keyof typeof LOG_TYPES]?.severity === "warning").length,
    };
  }, [logs, logStatsUseLiveDate]);

  const exportLogs = () => {
    const headers = "ID,Date,Type,Utilisateur,Rôle,Détails,IP\n";
    const rows = filteredLogs.map(l =>
      `"${l.id}","${l.timestamp}","${LOG_TYPES[l.type as keyof typeof LOG_TYPES]?.label || l.type}","${l.user}","${l.userRole}","${l.details.replace(/"/g, '""')}","${l.ip}"`
    ).join("\n");
    downloadCsvFile(`logs_activite_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
    showToast("Logs exportés avec succès !", "success");
  };

  const canManageUsers = currentUser.role === "Super Admin" || currentUser.role === "Gérant";
  const isSuperAdmin = currentUser.role === "Super Admin";

  const tabs = [
    { id: "utilisateurs", label: "Utilisateurs", icon: Users },
    { id: "entreprise", label: "Entreprise", icon: Building },
    { id: "donnees", label: "Données", icon: Database },
    { id: "facturation", label: "Facturation", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "securite", label: "Sécurité", icon: Lock },
    { id: "logs", label: "Journaux", icon: History },
    { id: "sauvegarde", label: "Sauvegarde", icon: Download },
  ];

  const columns = [
    {
      key: "nom",
      label: "Utilisateur",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <Avatar initials={String(row.avatar)} color={String(row.color)} size="sm" />
          <div>
            <p className="font-medium text-foreground">{String(value)}</p>
            <p className="text-xs text-muted-foreground">{String(row.email)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      sortable: true,
      render: (value: unknown) => {
        const roleColors: Record<string, string> = {
          "Super Admin": "bg-stockpro-stock-error-bg text-stockpro-stock-error-fg dark:bg-stockpro-stock-error-fg/12 dark:text-stockpro-stock-error-fg",
          "Gérant": "bg-stockpro-navy/10 text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal",
          "Caissier": "bg-stockpro-stock-low-bg text-stockpro-stock-low-fg dark:bg-stockpro-stock-low-fg/12 dark:text-stockpro-stock-low-fg",
          "Responsable Stock": "bg-stockpro-navy-mid/15 text-stockpro-navy dark:bg-stockpro-navy-mid/20 dark:text-stockpro-signal",
          "Comptable": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[String(value)] || ""}`}>
            {String(value)}
          </span>
        );
      },
    },
    {
      key: "statut",
      label: "Statut",
      render: (value: unknown) => (
        <Badge variant={value === "actif" ? "success" : "default"}>
          {value === "actif" ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "derniereConnexion",
      label: "Dernière connexion",
      render: () => <span className="text-muted-foreground">Il y a 2h</span>,
    },
  ];

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, statut: u.statut === "actif" ? "inactif" : "actif" } : u)));
  };

  // Toggle switch component
  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );


  // Setting row component
  const SettingRow: React.FC<{
    label: string;
    description?: string;
    children: React.ReactNode;
  }> = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  // Render Users Tab
  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Gestion des utilisateurs</h3>
          <p className="text-sm text-muted-foreground">Gérez les accès et permissions de votre équipe</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => newUserModal.open()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        )}
      </div>

      <DataTable onToast={showToast}
        columns={columns}
        data={users.map((u) => ({ ...u, statut: "actif", derniereConnexion: "" }))}
        title="Liste des utilisateurs"
        pageSize={5}
        actions={(row) => {
          const user = users.find((u) => u.id === row.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Modifier"
                onClick={() => {
                  if (user) {
                    setSelectedUser(user);
                    setEditUserData({
                      nom: user.nom,
                      email: user.email,
                      role: user.role,
                    });
                    editUserModal.open();
                  }
                }}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-navy dark:text-stockpro-signal hover:bg-stockpro-navy/8 dark:hover:bg-stockpro-signal/10"
                title="Réinitialiser mot de passe"
                onClick={() => {
                  setSelectedUser(user || null);
                  setResetPasswordTempPreview(`Temp${Math.random().toString(36).slice(-8)}!`);
                  resetPasswordModal.open();
                }}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleUserStatus(row.id as number)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-low-fg hover:bg-stockpro-stock-low-bg dark:hover:bg-stockpro-stock-low-fg/10"
                title={row.statut === "actif" ? "Désactiver" : "Activer"}
              >
                {row.statut === "actif" ? <Minus className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          );
        }}
      />
    </div>
  );

  // Render Enterprise Tab
  const renderEnterpriseTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Informations générales" description="Informations de votre entreprise">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom de l'entreprise</label>
            <Input
              value={enterpriseSettings.nomEntreprise}
              onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, nomEntreprise: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input
                type="email"
                value={enterpriseSettings.email}
                onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
              <Input
                value={enterpriseSettings.telephone}
                onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, telephone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Adresse</label>
            <Input
              value={enterpriseSettings.adresse}
              onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, adresse: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Pays</label>
              <Select
                value={enterpriseSettings.pays}
                onChange={(v) => setEnterpriseSettings({ ...enterpriseSettings, pays: v })}
                options={[
                  { value: "Mali", label: "Mali" },
                  { value: "Sénégal", label: "Sénégal" },
                  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
                  { value: "Burkina Faso", label: "Burkina Faso" },
                  { value: "Niger", label: "Niger" },
                  { value: "Guinée", label: "Guinée" },
                  { value: "Bénin", label: "Bénin" },
                  { value: "Togo", label: "Togo" },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Devise</label>
              <Select
                value={enterpriseSettings.devise}
                onChange={(v) => setEnterpriseSettings({ ...enterpriseSettings, devise: v })}
                options={[
                  { value: "FCFA", label: "FCFA (Franc CFA)" },
                  { value: "XOF", label: "XOF (Franc CFA BCEAO)" },
                  { value: "XAF", label: "XAF (Franc CFA BEAC)" },
                  { value: "EUR", label: "EUR (Euro)" },
                  { value: "USD", label: "USD (Dollar US)" },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Logo et image" description="Personnalisez l'apparence de vos documents">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border dark:border-border overflow-hidden">
              {enterpriseSettings.logo ? (
                <img src={enterpriseSettings.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Building className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="logo-upload"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      showToast("Le fichier est trop volumineux (max 2MB)", "error");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setEnterpriseSettings({ ...enterpriseSettings, logo: event.target?.result as string });
                      showToast("Logo chargé avec succès !", "success");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('logo-upload');
                  input?.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Charger un logo
              </Button>
              {enterpriseSettings.logo && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    setEnterpriseSettings({ ...enterpriseSettings, logo: null });
                    showToast("Logo supprimé", "success");
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou SVG. Max 2MB. Recommandé: 200x200px</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={() => showToast("Paramètres de l'entreprise enregistrés", "success")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );

  // Render Invoice Tab
  const renderInvoiceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Numérotation des documents" description="Configurez les préfixes de vos documents">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Préfixe factures</label>
              <Input
                value={invoiceSettings.prefixFacture}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefixFacture: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prochain numéro</label>
              <Input
                type="number"
                value={invoiceSettings.numeroSuivant}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, numeroSuivant: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Préfixe devis</label>
              <Input
                value={invoiceSettings.prefixDevis}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefixDevis: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Préfixe avoirs</label>
              <Input
                value={invoiceSettings.prefixAvoir}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefixAvoir: e.target.value })}
              />
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Aperçu: <span className="font-mono font-semibold">{invoiceSettings.prefixFacture}-{invoiceSettings.numeroSuivant}</span></p>
          </div>
        </div>
      </Card>

      <Card title="Paramètres TVA et paiement" description="Configuration fiscale et conditions">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">TVA par défaut (%)</label>
              <Input
                type="number"
                value={invoiceSettings.tvaDefaut}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tvaDefaut: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Délai paiement (jours)</label>
              <Input
                type="number"
                value={invoiceSettings.delaiPaiement}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, delaiPaiement: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Conditions de paiement</label>
            <Input
              value={invoiceSettings.conditionsPaiement}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, conditionsPaiement: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes en pied de page</label>
            <textarea
              value={invoiceSettings.notesPied}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, notesPied: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
              rows={2}
            />
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={() => showToast("Paramètres de facturation enregistrés", "success")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );

  // Render Notifications Tab
  const renderNotificationsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        className="lg:col-span-2"
        title="Tableau de bord"
        description="Bannière de bienvenue affichée lorsque vous n'avez pas encore de favoris ni de produits récemment consultés"
      >
        <p className="text-sm text-muted-foreground mb-3">
          Si vous l&apos;avez fermée, vous pouvez la réafficher depuis ici avant de retourner sur le dashboard.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            try {
              localStorage.removeItem(STOCKPRO_WELCOME_DISMISSED_KEY);
            } catch {
              /* ignore */
            }
            window.dispatchEvent(new Event(STOCKPRO_WELCOME_RESET_EVENT));
            showToast(
              "La bannière pourra réapparaître sur le tableau de bord (sans favoris ni historique récent).",
              "success",
            );
          }}
        >
          Réafficher la bannière de bienvenue
        </Button>
      </Card>

      <Card title="Alertes automatiques" description="Configurez les alertes système">
        <div className="space-y-1">
          <SettingRow
            label="Alerte stock minimum"
            description="Notification quand le stock atteint le seuil minimum"
          >
            <ToggleSwitch
              enabled={notificationSettings.alerteStockMin}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, alerteStockMin: v })}
            />
          </SettingRow>
          <SettingRow
            label="Alerte rupture de stock"
            description="Notification immédiate en cas de rupture"
          >
            <ToggleSwitch
              enabled={notificationSettings.alerteRupture}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, alerteRupture: v })}
            />
          </SettingRow>
          <SettingRow
            label="Confirmation de paiement"
            description="Notification à chaque paiement reçu"
          >
            <ToggleSwitch
              enabled={notificationSettings.alertePaiement}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, alertePaiement: v })}
            />
          </SettingRow>
          <SettingRow
            label="Rappel d'échéance"
            description="Rappel pour les factures arrivant à échéance"
          >
            <ToggleSwitch
              enabled={notificationSettings.rappelEcheance}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, rappelEcheance: v })}
            />
          </SettingRow>
        </div>
      </Card>

      <Card title="Rapports automatiques" description="Fréquence des rapports envoyés">
        <div className="space-y-1">
          <SettingRow
            label="Rapport journalier"
            description="Recevoir un résumé quotidien par email"
          >
            <ToggleSwitch
              enabled={notificationSettings.rapportJournalier}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, rapportJournalier: v })}
            />
          </SettingRow>
          <SettingRow
            label="Rapport hebdomadaire"
            description="Recevoir un résumé hebdomadaire chaque lundi"
          >
            <ToggleSwitch
              enabled={notificationSettings.rapportHebdo}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, rapportHebdo: v })}
            />
          </SettingRow>
        </div>
      </Card>

      <Card title="Canaux de notification" description="Moyens de réception des alertes">
        <div className="space-y-1">
          <SettingRow
            label="Notifications par email"
            description="Recevoir les alertes par email"
          >
            <ToggleSwitch
              enabled={notificationSettings.emailNotifications}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, emailNotifications: v })}
            />
          </SettingRow>
          <SettingRow
            label="Notifications par SMS"
            description="Recevoir les alertes critiques par SMS"
          >
            <ToggleSwitch
              enabled={notificationSettings.smsNotifications}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, smsNotifications: v })}
            />
          </SettingRow>
        </div>
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email administrateur</label>
            <Input
              type="email"
              value={notificationSettings.emailAdmin}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAdmin: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Téléphone SMS</label>
            <Input
              value={notificationSettings.smsPhone}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, smsPhone: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={() => showToast("Paramètres de notifications enregistrés", "success")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );

  // Render Security Tab
  const renderSecurityTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Authentification" description="Paramètres de connexion et session">
        <div className="space-y-1">
          <SettingRow
            label="Authentification 2FA"
            description="Renforcer la sécurité avec double authentification"
          >
            <ToggleSwitch
              enabled={securitySettings.authentification2FA}
              onChange={(v) => setSecuritySettings({ ...securitySettings, authentification2FA: v })}
            />
          </SettingRow>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground">Durée de session</p>
              <p className="text-xs text-muted-foreground mt-0.5">Déconnexion automatique après inactivité</p>
            </div>
            <Select
              value={String(securitySettings.sessionTimeout)}
              onChange={(v) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(v) })}
              options={[
                { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "60", label: "1 heure" },
                { value: "120", label: "2 heures" },
                { value: "480", label: "8 heures" },
              ]}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground">Tentatives de connexion</p>
              <p className="text-xs text-muted-foreground mt-0.5">Verrouillage après échecs</p>
            </div>
            <Select
              value={String(securitySettings.maxLoginAttempts)}
              onChange={(v) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(v) })}
              options={[
                { value: "3", label: "3 tentatives" },
                { value: "5", label: "5 tentatives" },
                { value: "10", label: "10 tentatives" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title="Politique de mots de passe" description="Exigences de sécurité des mots de passe">
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground">Longueur minimum</p>
              <p className="text-xs text-muted-foreground mt-0.5">Nombre de caractères requis</p>
            </div>
            <Select
              value={String(securitySettings.passwordMinLength)}
              onChange={(v) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(v) })}
              options={[
                { value: "6", label: "6 caractères" },
                { value: "8", label: "8 caractères" },
                { value: "10", label: "10 caractères" },
                { value: "12", label: "12 caractères" },
              ]}
            />
          </div>
          <SettingRow
            label="Exiger une majuscule"
            description="Au moins une lettre majuscule"
          >
            <ToggleSwitch
              enabled={securitySettings.passwordRequireUppercase}
              onChange={(v) => setSecuritySettings({ ...securitySettings, passwordRequireUppercase: v })}
            />
          </SettingRow>
          <SettingRow
            label="Exiger un chiffre"
            description="Au moins un chiffre"
          >
            <ToggleSwitch
              enabled={securitySettings.passwordRequireNumber}
              onChange={(v) => setSecuritySettings({ ...securitySettings, passwordRequireNumber: v })}
            />
          </SettingRow>
          <SettingRow
            label="Exiger un caractère spécial"
            description="Au moins un caractère spécial (!@#$%...)"
          >
            <ToggleSwitch
              enabled={securitySettings.passwordRequireSpecial}
              onChange={(v) => setSecuritySettings({ ...securitySettings, passwordRequireSpecial: v })}
            />
          </SettingRow>
        </div>
      </Card>

      <Card title="Journal d'activité" description="Historique des actions importantes">
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Connexion réussie</p>
              <p className="text-xs text-muted-foreground">Admin - Il y a 2h</p>
            </div>
            <Badge variant="success">Succès</Badge>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Mot de passe modifié</p>
              <p className="text-xs text-muted-foreground">Admin - Hier 14:30</p>
            </div>
            <Badge variant="info">Info</Badge>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Tentative échouée</p>
              <p className="text-xs text-muted-foreground">user@inconnu.com - Hier 09:15</p>
            </div>
            <Badge variant="warning">Alerte</Badge>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => {
          const journalData = [
            { action: "Connexion réussie", utilisateur: "Admin", date: "Il y a 2h", statut: "Succès" },
            { action: "Mot de passe modifié", utilisateur: "Admin", date: "Hier 14:30", statut: "Info" },
            { action: "Tentative échouée", utilisateur: "user@inconnu.com", date: "Hier 09:15", statut: "Alerte" },
            { action: "Export données", utilisateur: "Admin", date: "12/12/2024 16:45", statut: "Succès" },
            { action: "Nouveau produit ajouté", utilisateur: "Fatima N.", date: "12/12/2024 11:20", statut: "Info" },
            { action: "Sauvegarde automatique", utilisateur: "Système", date: "12/12/2024 00:00", statut: "Succès" },
          ];
          const headers = "Action,Utilisateur,Date,Statut\n";
          const rows = journalData.map(j =>
            `"${j.action}","${j.utilisateur}","${j.date}","${j.statut}"`
          ).join("\n");
          downloadCsvFile(`journal_activite_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
          showToast("Journal exporté avec succès !", "success");
        }}>
          <Download className="w-4 h-4 mr-2" />
          Exporter le journal
        </Button>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={() => showToast("Paramètres de sécurité enregistrés", "success")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );

  // Render Logs Tab - Journal d'activité avec DataTable
  const renderLogsTab = () => {
    const handleSort = (field: string) => {
      if (logSortField === field) {
        setLogSortDirection(logSortDirection === "asc" ? "desc" : "asc");
      } else {
        setLogSortField(field);
        setLogSortDirection("desc");
      }
    };

    const formatTimestamp = (timestamp: string) => {
      const parts = timestamp.split(" ");
      const date = parts[0] || "";
      const time = parts[1] || "";
      return { date, time };
    };

    const SortIcon = ({ field }: { field: string }) => {
      if (logSortField !== field) {
        return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
      }
      return logSortDirection === "asc"
        ? <ArrowUp className="w-4 h-4 text-stockpro-stock-ok-fg" />
        : <ArrowDown className="w-4 h-4 text-stockpro-stock-ok-fg" />;
    };

    return (
      <div className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted p-4 dark:from-card dark:to-muted/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-foreground mt-1">{logStats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-stockpro-navy/8 to-stockpro-navy/12 dark:from-stockpro-signal/10 dark:to-stockpro-signal/8 rounded-xl p-4 border border-stockpro-navy/20 dark:border-stockpro-signal/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stockpro-navy dark:text-stockpro-signal uppercase tracking-wide">Aujourd'hui</p>
                <p className="text-2xl font-bold text-stockpro-navy dark:text-stockpro-signal mt-1">{logStats.today}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-stockpro-navy/20 dark:bg-stockpro-signal/25 flex items-center justify-center">
                <Clock className="h-5 w-5 text-stockpro-navy dark:text-stockpro-signal" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-stockpro-stock-low-bg to-stockpro-stock-low-bg dark:from-stockpro-stock-low-fg/12 dark:to-stockpro-stock-low-fg/8 rounded-xl p-4 border border-stockpro-stock-low-fg/25 dark:border-stockpro-stock-low-fg/35">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stockpro-stock-low-fg uppercase tracking-wide">Avertissements</p>
                <p className="text-2xl font-bold text-stockpro-stock-low-fg mt-1">{logStats.warnings}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-stockpro-stock-low-bg dark:bg-stockpro-stock-low-fg/25 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-stockpro-stock-low-fg" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-stockpro-stock-error-fg/25 bg-gradient-to-br from-stockpro-stock-error-bg to-stockpro-stock-error-bg p-4 dark:border-stockpro-stock-error-fg/35 dark:from-stockpro-stock-error-fg/10 dark:to-stockpro-stock-error-fg/6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stockpro-stock-error-fg">Erreurs</p>
                <p className="text-2xl font-bold text-stockpro-stock-error-fg mt-1">{logStats.errors}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-stockpro-stock-error-bg dark:bg-stockpro-stock-error-fg/25 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-stockpro-stock-error-fg" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <Card padding="sm" className="!p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={logSearchTerm}
                onChange={(e) => {
                  setLogSearchTerm(e.target.value);
                  setLogPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal focus:border-transparent"
              />
            </div>
            <select
              value={logFilterCategory}
              onChange={(e) => {
                setLogFilterCategory(e.target.value);
                setLogPage(1);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            >
              <option value="all">Toutes catégories</option>
              {LOG_CATEGORIES.filter(c => c.id !== "all").map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select
              value={logFilterSeverity}
              onChange={(e) => {
                setLogFilterSeverity(e.target.value);
                setLogPage(1);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            >
              <option value="all">Toutes sévérités</option>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="danger">Erreur</option>
            </select>
            <input
              type="date"
              value={logFilterDate}
              onChange={(e) => {
                setLogFilterDate(e.target.value);
                setLogPage(1);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* DataTable */}
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("timestamp")}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date & Heure
                      <SortIcon field="timestamp" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      <SortIcon field="type" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("user")}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Utilisateur
                      <SortIcon field="user" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("details")}
                  >
                    <div className="flex items-center gap-2">
                      Détails
                      <SortIcon field="details" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("ip")}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      IP
                      <SortIcon field="ip" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <History className="w-10 h-10 text-muted-foreground/40 dark:text-muted-foreground/60 mb-3" />
                        <p className="text-muted-foreground text-sm">Aucun log trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => {
                    const logType = LOG_TYPES[log.type as keyof typeof LOG_TYPES];
                    const severity = logType?.severity || "info";
                    const severityStyle = SEVERITY_STYLES[severity as keyof typeof SEVERITY_STYLES];
                    const { date, time } = formatTimestamp(log.timestamp);

                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedLog(log);
                          logDetailsModal.open();
                        }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{date}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {time}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{logType?.icon || "📋"}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityStyle.bg} ${severityStyle.text}`}>
                              {logType?.label || log.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{log.user}</span>
                            <span className="text-xs text-muted-foreground">{log.userRole}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground line-clamp-2 max-w-md">
                            {log.details}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                            {log.ip}
                          </code>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                              logDetailsModal.open();
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-muted/80 dark:bg-muted/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Afficher</span>
                  <select
                    value={logPageSize}
                    onChange={(e) => {
                      setLogPageSize(Number(e.target.value));
                      setLogPage(1);
                    }}
                    className="px-2 py-1 text-sm rounded border border-border bg-card text-foreground"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entrées</span>
                  <span className="text-muted-foreground mx-2">|</span>
                  <span>
                    {((logPage - 1) * logPageSize) + 1} à {Math.min(logPage * logPageSize, filteredLogs.length)} sur {filteredLogs.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLogPage(1)}
                    disabled={logPage === 1}
                    className="p-2 rounded-lg hover:bg-muted dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Première page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLogPage(p => Math.max(1, p - 1))}
                    disabled={logPage === 1}
                    className="p-2 rounded-lg hover:bg-muted dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(5, totalLogPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalLogPages <= 5) {
                        pageNum = i + 1;
                      } else if (logPage <= 3) {
                        pageNum = i + 1;
                      } else if (logPage >= totalLogPages - 2) {
                        pageNum = totalLogPages - 4 + i;
                      } else {
                        pageNum = logPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setLogPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pageNum === logPage
                            ? "bg-stockpro-signal text-stockpro-navy-night"
                            : "hover:bg-muted dark:hover:bg-muted text-muted-foreground"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))}
                    disabled={logPage === totalLogPages}
                    className="p-2 rounded-lg hover:bg-muted dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLogPage(totalLogPages)}
                    disabled={logPage === totalLogPages}
                    className="p-2 rounded-lg hover:bg-muted dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Dernière page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Modal Détails Log */}
        <Modal
          isOpen={logDetailsModal.isOpen}
          onClose={() => {
            logDetailsModal.close();
            setSelectedLog(null);
          }}
          title="Détails de l'activité"
          size="lg"
        >
          {selectedLog && (() => {
            const logType = LOG_TYPES[selectedLog.type as keyof typeof LOG_TYPES];
            const severity = logType?.severity || "info";
            const severityStyle = SEVERITY_STYLES[severity as keyof typeof SEVERITY_STYLES];
            const { date, time } = formatTimestamp(selectedLog.timestamp);

            return (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${severityStyle.bg} border`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{logType?.icon || "📋"}</span>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-lg ${severityStyle.text}`}>
                        {logType?.label || selectedLog.type}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Utilisateur</p>
                    </div>
                    <p className="font-semibold text-foreground">{selectedLog.user}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedLog.userRole}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Adresse IP</p>
                    </div>
                    <p className="font-semibold text-foreground font-mono">{selectedLog.ip}</p>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Détails</p>
                  </div>
                  <p className="text-foreground leading-relaxed">{selectedLog.details}</p>
                </div>

                {Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Métadonnées</p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-sm text-foreground font-medium text-right max-w-[60%]">
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => {
                    logDetailsModal.close();
                    setSelectedLog(null);
                  }}>
                    Fermer
                  </Button>
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                    showToast("Log copié dans le presse-papiers", "success");
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier JSON
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    );
  };

  // Render Backup Tab
  const renderBackupTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Sauvegarde automatique" description="Configuration des sauvegardes">
        <div className="space-y-1">
          <SettingRow
            label="Sauvegarde automatique"
            description="Activer les sauvegardes planifiées"
          >
            <ToggleSwitch
              enabled={backupSettings.autoBackup}
              onChange={(v) => setBackupSettings({ ...backupSettings, autoBackup: v })}
            />
          </SettingRow>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground">Fréquence</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rythme des sauvegardes</p>
            </div>
            <Select
              value={backupSettings.backupFrequency}
              onChange={(v) => setBackupSettings({ ...backupSettings, backupFrequency: v })}
              options={[
                { value: "daily", label: "Quotidienne" },
                { value: "weekly", label: "Hebdomadaire" },
                { value: "monthly", label: "Mensuelle" },
              ]}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground">Heure de sauvegarde</p>
              <p className="text-xs text-muted-foreground mt-0.5">Moment de la sauvegarde</p>
            </div>
            <Input
              type="time"
              value={backupSettings.backupTime}
              onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
              className="w-32"
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground">Rétention</p>
              <p className="text-xs text-muted-foreground mt-0.5">Durée de conservation</p>
            </div>
            <Select
              value={String(backupSettings.retentionDays)}
              onChange={(v) => setBackupSettings({ ...backupSettings, retentionDays: parseInt(v) })}
              options={[
                { value: "7", label: "7 jours" },
                { value: "14", label: "14 jours" },
                { value: "30", label: "30 jours" },
                { value: "60", label: "60 jours" },
                { value: "90", label: "90 jours" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title="Statut des sauvegardes" description="Informations sur les dernières sauvegardes">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-stockpro-stock-ok-fg/25 bg-stockpro-stock-ok-bg dark:border-stockpro-stock-ok-fg/35 dark:bg-stockpro-stock-ok-fg/10">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-stockpro-stock-ok-fg" />
              <div>
                <p className="font-medium text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">Dernière sauvegarde réussie</p>
                <p className="text-sm text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{backupSettings.lastBackup}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Prochaine sauvegarde</p>
                <p className="text-sm text-muted-foreground">{backupSettings.nextBackup}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => showToast("Sauvegarde manuelle lancée...", "info")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sauvegarder maintenant
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Export des données" description="Téléchargez vos données">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const headers = "Nom,SKU,Catégorie,Prix Achat,Prix Vente,Stock,Stock Min,Unité,TVA\n";
                const rows = MOCK_PRODUCTS.map(p =>
                  `"${p.nom}","${p.sku}","${p.categorie}",${p.prixAchat},${p.prixVente},${p.stock},${p.stockMin},"${p.unite}",${p.tva}`
                ).join("\n");
                downloadCsvFile(`produits_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
                addLogWithCurrentUser("SETTINGS_EXPORT", "Export des données produits", { exportType: "produits", format: "CSV", records: MOCK_PRODUCTS.length });
                showToast("Export produits téléchargé !", "success");
              }}
              className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <Package className="w-6 h-6 text-stockpro-navy dark:text-stockpro-signal mb-2" />
              <p className="font-medium text-foreground">Produits</p>
              <p className="text-xs text-muted-foreground">CSV, Excel</p>
            </button>
            <button
              onClick={() => {
                const headers = "Nom,Téléphone,Email,Type,CA Total,Solde,Statut,Date Création\n";
                const rows = MOCK_CLIENTS.map(c =>
                  `"${c.nom}","${c.telephone}","${c.email}","${c.type}",${c.caTotal},${c.solde},"${c.statut}","${c.dateCreation}"`
                ).join("\n");
                downloadCsvFile(`clients_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
                addLogWithCurrentUser("SETTINGS_EXPORT", "Export des données clients", { exportType: "clients", format: "CSV", records: MOCK_CLIENTS.length });
                showToast("Export clients téléchargé !", "success");
              }}
              className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <Users className="w-6 h-6 text-stockpro-stock-ok-fg mb-2" />
              <p className="font-medium text-foreground">Clients</p>
              <p className="text-xs text-muted-foreground">CSV, Excel</p>
            </button>
            <button
              onClick={() => {
                const headers = "ID,Produit,Client,Montant,Mode Paiement,Statut,Date\n";
                const rows = MOCK_TRANSACTIONS.map(t =>
                  `"${t.id}","${t.produit}","${t.client}",${t.montant},"${t.modePaiement}","${t.statut}","${t.date}"`
                ).join("\n");
                downloadCsvFile(`ventes_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
                addLogWithCurrentUser("SETTINGS_EXPORT", "Export des données ventes", { exportType: "ventes", format: "CSV", records: MOCK_TRANSACTIONS.length });
                showToast("Export ventes téléchargé !", "success");
              }}
              className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <BarChart3 className="mb-2 h-6 w-6 text-stockpro-stock-low-fg" />
              <p className="font-medium text-foreground">Ventes</p>
              <p className="text-xs text-muted-foreground">CSV, Excel</p>
            </button>
            <button
              onClick={() => {
                const headers = "Produit,SKU,Catégorie,Stock Actuel,Stock Min,Statut\n";
                const rows = MOCK_PRODUCTS.map(p =>
                  `"${p.nom}","${p.sku}","${p.categorie}",${p.stock},${p.stockMin},"${p.stock === 0 ? 'Rupture' : p.stock <= p.stockMin ? 'Critique' : 'OK'}"`
                ).join("\n");
                downloadCsvFile(`stock_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
                addLogWithCurrentUser("SETTINGS_EXPORT", "Export des données stock", { exportType: "stock", format: "CSV", records: MOCK_PRODUCTS.length });
                showToast("Export stock téléchargé !", "success");
              }}
              className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <Boxes className="w-6 h-6 text-stockpro-stock-error-fg mb-2" />
              <p className="font-medium text-foreground">Stock</p>
              <p className="text-xs text-muted-foreground">CSV, Excel</p>
            </button>
          </div>
          <Button variant="outline" className="w-full" onClick={() => {
            // Export complet - créer un ZIP avec tous les fichiers (simulation)
            showToast("Export complet en cours...", "info");
            setTimeout(() => {
              // Export produits
              const prodHeaders = "Nom,SKU,Catégorie,Prix Achat,Prix Vente,Stock,Stock Min,Unité,TVA\n";
              const prodRows = MOCK_PRODUCTS.map(p =>
                `"${p.nom}","${p.sku}","${p.categorie}",${p.prixAchat},${p.prixVente},${p.stock},${p.stockMin},"${p.unite}",${p.tva}`
              ).join("\n");

              // Export clients
              const cliHeaders = "Nom,Téléphone,Email,Type,CA Total,Solde,Statut,Date Création\n";
              const cliRows = MOCK_CLIENTS.map(c =>
                `"${c.nom}","${c.telephone}","${c.email}","${c.type}",${c.caTotal},${c.solde},"${c.statut}","${c.dateCreation}"`
              ).join("\n");

              // Export ventes
              const ventHeaders = "ID,Produit,Client,Montant,Mode Paiement,Statut,Date\n";
              const ventRows = MOCK_TRANSACTIONS.map(t =>
                `"${t.id}","${t.produit}","${t.client}",${t.montant},"${t.modePaiement}","${t.statut}","${t.date}"`
              ).join("\n");

              // Export factures
              const facHeaders = "ID,Client,Date,Montant,Statut,Échéance\n";
              const facRows = MOCK_FACTURES.map(f =>
                `"${f.id}","${f.client}","${f.date}",${f.montant},"${f.statut}","${f.echeance}"`
              ).join("\n");

              // Créer un fichier combiné
              const combinedContent = `=== PRODUITS ===\n${prodHeaders}${prodRows}\n\n=== CLIENTS ===\n${cliHeaders}${cliRows}\n\n=== VENTES ===\n${ventHeaders}${ventRows}\n\n=== FACTURES ===\n${facHeaders}${facRows}`;
              downloadCsvFile(`export_complet_${new Date().toISOString().split("T")[0]}.csv`, combinedContent);
              showToast("Export complet téléchargé !", "success");
            }, 500);
          }}>
            <Download className="w-4 h-4 mr-2" />
            Exporter toutes les données
          </Button>
        </div>
      </Card>

      <Card title="Import de données" description="Importez vos données existantes">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Glissez-déposez vos fichiers ici</p>
            <p className="text-xs text-muted-foreground mt-1">ou</p>
            <input
              type="file"
              id="import-file"
              accept=".csv,.xlsx,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    showToast("Le fichier est trop volumineux (max 10MB)", "error");
                    return;
                  }
                  showToast(`Import de "${file.name}" en cours...`, "info");
                  setTimeout(() => {
                    showToast(`Import terminé ! ${Math.floor(Math.random() * 50) + 10} enregistrements importés`, "success");
                  }, 1500);
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                const input = document.getElementById('import-file');
                input?.click();
              }}
            >
              Parcourir
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Formats supportés: CSV, XLSX, JSON. Taille max: 10MB</p>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={() => showToast("Paramètres de sauvegarde enregistrés", "success")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="text-center p-8">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-stockpro-stock-low-fg" />
          <h3 className="text-lg font-semibold text-foreground">Accès restreint</h3>
          <p className="text-muted-foreground mt-2">Vous n&apos;avez pas les permissions pour accéder à cette page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres</h2>
        <p className="text-muted-foreground">Configurez votre application selon vos besoins</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "utilisateurs" && renderUsersTab()}
          {activeTab === "entreprise" && renderEnterpriseTab()}
          {activeTab === "donnees" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Categories Section */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Catégories de produits</h3>
                    <p className="text-sm text-muted-foreground">Gérez les catégories pour classifier vos produits</p>
                  </div>
                  <Button size="sm" onClick={() => { setEditingCategory(null); setNewCategory({ nom: "", color: "#1a2b6d" }); categoryModal.open(); }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium text-foreground">{cat.nom}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 rounded hover:bg-muted"
                          title="Modifier"
                          onClick={() => { setEditingCategory(cat); setNewCategory({ nom: cat.nom, color: cat.color }); categoryModal.open(); }}
                        >
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
                          title="Supprimer"
                          onClick={() => {
                            setCategories(categories.filter(c => c.id !== cat.id));
                            showToast(`Catégorie "${cat.nom}" supprimée`, "success");
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-stockpro-stock-error-fg" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {/* Add new category button */}
                  <button
                    className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-stockpro-signal/50 hover:text-stockpro-navy dark:hover:text-stockpro-signal transition-colors"
                    onClick={() => { setEditingCategory(null); setNewCategory({ nom: "", color: "#1a2b6d" }); categoryModal.open(); }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Nouvelle catégorie</span>
                  </button>
                </div>
              </Card>

              {/* Units Section */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Unités de mesure</h3>
                    <p className="text-sm text-muted-foreground">Définissez les unités pour vos produits</p>
                  </div>
                  <Button size="sm" onClick={() => { setEditingUnit(null); setNewUnit({ nom: "", abreviation: "" }); unitModal.open(); }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {unites.map((unite) => (
                    <motion.div
                      key={unite.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stockpro-navy dark:text-stockpro-signal">{unite.abreviation}</span>
                        <span className="text-muted-foreground">{unite.nom}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 rounded hover:bg-muted"
                          title="Modifier"
                          onClick={() => { setEditingUnit(unite); setNewUnit({ nom: unite.nom, abreviation: unite.abreviation }); unitModal.open(); }}
                        >
                          <Edit className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
                          title="Supprimer"
                          onClick={() => {
                            setUnites(unites.filter(u => u.id !== unite.id));
                            showToast(`Unité "${unite.nom}" supprimée`, "success");
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-stockpro-stock-error-fg" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {/* Add new unit button */}
                  <button
                    className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-stockpro-signal/50 hover:text-stockpro-navy dark:hover:text-stockpro-signal transition-colors"
                    onClick={() => { setEditingUnit(null); setNewUnit({ nom: "", abreviation: "" }); unitModal.open(); }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Nouvelle unité</span>
                  </button>
                </div>
              </Card>

              {/* Client Types */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Types de clients</h3>
                    <p className="text-sm text-muted-foreground">Catégorisez votre clientèle</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: "VIP", desc: "Clients privilégiés", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
                    { type: "Grossiste", desc: "Achats en gros", color: "bg-stockpro-navy/10 text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal" },
                    { type: "Détaillant", desc: "Achats au détail", color: "bg-stockpro-navy/8 text-stockpro-navy-mid dark:bg-stockpro-signal/10 dark:text-stockpro-signal" },
                    { type: "Particulier", desc: "Clients occasionnels", color: "bg-muted text-foreground" },
                  ].map((item) => (
                    <div key={item.type} className={`p-4 rounded-lg ${item.color}`}>
                      <p className="font-semibold">{item.type}</p>
                      <p className="text-xs opacity-75">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment Methods */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Modes de paiement</h3>
                    <p className="text-sm text-muted-foreground">Moyens de paiement acceptés</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { method: "Espèces", icon: <Wallet className="w-5 h-5" />, active: true },
                    { method: "Carte bancaire", icon: <CreditCard className="w-5 h-5" />, active: true },
                    { method: "Mobile Money", icon: <Smartphone className="w-5 h-5" />, active: true },
                    { method: "Chèque", icon: <FileText className="w-5 h-5" />, active: false },
                    { method: "Virement", icon: <Send className="w-5 h-5" />, active: true },
                    { method: "Crédit", icon: <Clock className="w-5 h-5" />, active: true },
                  ].map((item) => (
                    <div
                      key={item.method}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${item.active
                        ? "border-stockpro-stock-ok-fg/30 bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/10"
                        : "border-border bg-muted/30"
                        }`}
                    >
                      <div className={item.active ? "text-stockpro-stock-ok-fg" : "text-muted-foreground"}>
                        {item.icon}
                      </div>
                      <span className={`font-medium ${item.active ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.method}
                      </span>
                      {item.active && <Check className="w-4 h-4 text-stockpro-stock-ok-fg ml-auto" />}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
          {activeTab === "facturation" && renderInvoiceTab()}
          {activeTab === "notifications" && renderNotificationsTab()}
          {activeTab === "securite" && renderSecurityTab()}
          {activeTab === "logs" && renderLogsTab()}
          {activeTab === "sauvegarde" && renderBackupTab()}
        </motion.div>
      </AnimatePresence>

      {/* Add User Modal */}
      <Modal isOpen={newUserModal.isOpen} onClose={() => newUserModal.close()} title="Nouvel utilisateur">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Utilisateur créé avec succès ! Un email d'activation a été envoyé.", "success");
            newUserModal.close();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
            <Input placeholder="Nom et prénom" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input type="email" placeholder="email@exemple.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rôle</label>
            <Select
              value=""
              onChange={() => { }}
              options={[
                { value: "gerant", label: "Gérant" },
                { value: "caissier", label: "Caissier" },
                { value: "stock", label: "Responsable Stock" },
                { value: "compta", label: "Comptable" },
              ]}
              placeholder="Sélectionner un rôle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Mot de passe temporaire</label>
            <Input type="password" placeholder="Mot de passe" required />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => newUserModal.close()}>
              Annuler
            </Button>
            <Button type="submit">Créer l&apos;utilisateur</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editUserModal.isOpen} onClose={() => editUserModal.close()} title="Modifier l'utilisateur">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedUser) {
              setUsers(users.map((u) =>
                u.id === selectedUser.id
                  ? { ...u, nom: editUserData.nom, email: editUserData.email, role: editUserData.role }
                  : u
              ));
              showToast(`Utilisateur "${editUserData.nom}" modifié avec succès`, "success");
              editUserModal.close();
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
            <Input
              value={editUserData.nom}
              onChange={(e) => setEditUserData({ ...editUserData, nom: e.target.value })}
              placeholder="Nom et prénom"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              type="email"
              value={editUserData.email}
              onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
              placeholder="email@exemple.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rôle</label>
            <Select
              value={editUserData.role}
              onChange={(v) => setEditUserData({ ...editUserData, role: v })}
              options={[
                { value: "Super Admin", label: "Super Admin" },
                { value: "Gérant", label: "Gérant" },
                { value: "Caissier", label: "Caissier" },
                { value: "Responsable Stock", label: "Responsable Stock" },
                { value: "Comptable", label: "Comptable" },
              ]}
              placeholder="Sélectionner un rôle"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => editUserModal.close()}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordModal.isOpen}
        onClose={() => {
          resetPasswordModal.close();
          setResetPasswordTempPreview("");
        }}
        title="Réinitialiser le mot de passe"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar initials={selectedUser.avatar} color={selectedUser.color} size="md" />
              <div>
                <p className="font-medium text-foreground">{selectedUser.nom}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>

            <Alert variant="info">
              Un nouveau mot de passe temporaire sera généré et envoyé par email à l&apos;utilisateur.
            </Alert>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nouveau mot de passe temporaire
              </label>
              <Input
                type="text"
                value={resetPasswordTempPreview}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="forceReset"
                defaultChecked
                className="w-4 h-4 rounded border-border text-stockpro-navy dark:text-stockpro-signal focus:ring-stockpro-signal"
              />
              <label htmlFor="forceReset" className="text-sm text-muted-foreground">
                Forcer le changement de mot de passe à la prochaine connexion
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  resetPasswordModal.close();
                  setResetPasswordTempPreview("");
                }}
              >
                Annuler
              </Button>
              <Button onClick={() => {
                showToast(`Mot de passe réinitialisé pour ${selectedUser.nom}. Email envoyé.`, "success");
                resetPasswordModal.close();
                setResetPasswordTempPreview("");
              }}>
                <Key className="w-4 h-4 mr-2" />
                Réinitialiser et envoyer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModal.isOpen}
        onClose={() => categoryModal.close()}
        title={editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newCategory.nom.trim()) {
              showToast("Le nom de la catégorie est requis", "error");
              return;
            }
            if (editingCategory) {
              setCategories(categories.map(c =>
                c.id === editingCategory.id
                  ? { ...c, nom: newCategory.nom, color: newCategory.color }
                  : c
              ));
              showToast(`Catégorie "${newCategory.nom}" modifiée avec succès`, "success");
            } else {
              const newCat = {
                id: Math.max(...categories.map(c => c.id)) + 1,
                nom: newCategory.nom,
                color: newCategory.color
              };
              setCategories([...categories, newCat]);
              showToast(`Catégorie "${newCategory.nom}" ajoutée avec succès`, "success");
            }
            categoryModal.close();
            setNewCategory({ nom: "", color: "#1a2b6d" });
            setEditingCategory(null);
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nom de la catégorie <span className="text-stockpro-stock-error-fg">*</span>
            </label>
            <Input
              value={newCategory.nom}
              onChange={(e) => setNewCategory({ ...newCategory, nom: e.target.value })}
              placeholder="Ex: Boissons, Snacks..."
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Couleur
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <div className="flex gap-2">
                {["#6dc13a", "#1a2b6d", "#2a3d8f", "#e8932d", "#d93f3f", "#152456", "#0f1a45", "#f5f6fa"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newCategory.color === color ? "border-foreground scale-110" : "border-transparent hover:scale-110"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newCategory.color }} />
            <span className="text-sm text-muted-foreground">
              Aperçu: {newCategory.nom || "Nom de la catégorie"}
            </span>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => categoryModal.close()}>
              Annuler
            </Button>
            <Button type="submit">
              {editingCategory ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Unit Modal */}
      <Modal
        isOpen={unitModal.isOpen}
        onClose={() => unitModal.close()}
        title={editingUnit ? "Modifier l'unité" : "Nouvelle unité de mesure"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newUnit.nom.trim() || !newUnit.abreviation.trim()) {
              showToast("Le nom et l'abréviation sont requis", "error");
              return;
            }
            if (editingUnit) {
              setUnites(unites.map(u =>
                u.id === editingUnit.id
                  ? { ...u, nom: newUnit.nom, abreviation: newUnit.abreviation }
                  : u
              ));
              showToast(`Unité "${newUnit.nom}" modifiée avec succès`, "success");
            } else {
              const newU = {
                id: Math.max(...unites.map(u => u.id)) + 1,
                nom: newUnit.nom,
                abreviation: newUnit.abreviation
              };
              setUnites([...unites, newU]);
              showToast(`Unité "${newUnit.nom}" ajoutée avec succès`, "success");
            }
            unitModal.close();
            setNewUnit({ nom: "", abreviation: "" });
            setEditingUnit(null);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nom <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input
                value={newUnit.nom}
                onChange={(e) => setNewUnit({ ...newUnit, nom: e.target.value })}
                placeholder="Ex: kilogramme, litre..."
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Abréviation <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input
                value={newUnit.abreviation}
                onChange={(e) => setNewUnit({ ...newUnit, abreviation: e.target.value })}
                placeholder="Ex: kg, L, pc..."
                required
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground mt-1">Max 5 caractères</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="font-semibold text-stockpro-navy dark:text-stockpro-signal">
              {newUnit.abreviation || "abr"}
            </span>
            <span className="text-muted-foreground">
              = {newUnit.nom || "nom de l'unité"}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-stockpro-navy/20 bg-stockpro-navy/5 dark:border-stockpro-signal/30 dark:bg-stockpro-signal/8">
            <p className="text-sm text-stockpro-navy dark:text-stockpro-signal">
              <strong>Exemples courants:</strong> kg (kilogramme), L (litre), pc (pièce), m (mètre), pqt (paquet)
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => unitModal.close()}>
              Annuler
            </Button>
            <Button type="submit">
              {editingUnit ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛒 PAGE POINT DE VENTE (POS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
