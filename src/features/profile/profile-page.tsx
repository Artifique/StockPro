"use client";

import React, { useState } from "react";
import {
  Users,
  BarChart3,
  Bell,
  Edit,
  Download,
  AlertTriangle,
  Calendar,
  Mail,
  Lock,
  LogOut,
  User,
  Key,
  Phone,
  Check,
  MapPin,
  Smartphone,
  History,
} from "lucide-react";
import {
  MOCK_USERS,
} from "@/data/stock-mock";
import { downloadCsvFile } from "@/lib/export-csv";
import { Badge, Button, Card, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Avatar } from "@/components/stock-pro/primitives";

import { Profile } from "@/models/system.model";
import { SystemService } from "@/services/system.service";

export const ProfilePage: React.FC<{
  user: Profile;
  onLogout: () => void;
}> = ({ user, onLogout: _onLogout }) => {
  const [activeSection, setActiveSection] = useState("informations");
  const [isEditing, setIsEditing] = useState(false);
  const passwordModal = useDisclosure();
  const twoFAModal = useDisclosure();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAStep, setTwoFAStep] = useState<"setup" | "verify">("setup");

  // Form states
  const [profileData, setProfileData] = useState({
    nom: user.nom,
    email: user.email,
    telephone: "+223 70 00 00 00",
    adresse: "Bamako, Mali",
    bio: "Gestionnaire de stock expérimenté",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const closePasswordModal = () => {
    passwordModal.close();
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
  };

  const closeTwoFAModal = () => {
    twoFAModal.close();
    setTwoFACode("");
    setTwoFAStep("setup");
  };

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    stockAlerts: true,
    salesReports: false,
    newClients: true,
    weeklyDigest: true,
  });

  const sections = [
    { id: "informations", label: "Informations personnelles", icon: User },
    { id: "securite", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "activite", label: "Activité", icon: History },
  ];

  const handleSaveProfile = async () => {
    try {
      await SystemService.updateProfile(user.id, {
        nom: profileData.nom,
        email: profileData.email,
      });
      showToast("Profil mis à jour avec succès", "success");
      setIsEditing(false);
    } catch (error) {
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleChangePassword = () => {
    const errors: typeof passwordErrors = {};

    if (!passwordData.currentPassword) {
      errors.current = "Le mot de passe actuel est requis";
    }
    if (passwordData.newPassword.length < 8) {
      errors.new = "Le nouveau mot de passe doit contenir au moins 8 caractères";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirm = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    showToast("Mot de passe modifié avec succès", "success");
    passwordModal.close();
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
  };

  const recentActivity = [
    { id: 1, action: "Connexion depuis Bamako, Mali", date: "Aujourd'hui, 09:23", icon: User },
    { id: 2, action: "Modification du profil", date: "Hier, 14:45", icon: Edit },
    { id: 3, action: "Changement de mot de passe", date: "15 déc. 2024", icon: Lock },
    { id: 4, action: "Nouvelle session sur Chrome", date: "14 déc. 2024", icon: Smartphone },
    { id: 5, action: "Connexion depuis Mobile", date: "12 déc. 2024", icon: Smartphone },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header avec avatar et infos rapides */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-stockpro-navy via-stockpro-navy-mid to-stockpro-signal h-32" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="relative">
              <Avatar initials={user.avatar} color={user.color} size="lg" className="w-24 h-24 text-2xl ring-4 ring-white dark:ring-card" />
              <button
                className="absolute bottom-0 right-0 rounded-full bg-card p-1.5 shadow-lg transition-colors hover:bg-muted"
                title="Changer la photo"
              >
                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{user.nom}</h1>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
            <Badge variant={user.statut === "actif" ? "success" : "danger"} className="mt-2 sm:mt-0">
              {user.statut === "actif" ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Navigation et contenu */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation latérale */}
        <Card padding="sm" className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                    ? "bg-stockpro-navy/8 text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal"
                    : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Contenu principal */}
        <Card className="flex-1">
          {/* Section: Informations personnelles */}
          {activeSection === "informations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Informations personnelles
                </h2>
                <Button
                  variant={isEditing ? "primary" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nom complet
                  </label>
                  <Input
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                    disabled={!isEditing}
                    icon={<User className="w-5 h-5" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    icon={<Mail className="w-5 h-5" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Téléphone
                  </label>
                  <Input
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                    disabled={!isEditing}
                    icon={<Phone className="w-5 h-5" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Adresse
                  </label>
                  <Input
                    value={profileData.adresse}
                    onChange={(e) => setProfileData({ ...profileData, adresse: e.target.value })}
                    disabled={!isEditing}
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              {/* Rôle et permissions */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Rôle et permissions
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-stockpro-navy/10 dark:bg-stockpro-signal/12">
                      <Key className="w-5 h-5 text-stockpro-navy dark:text-stockpro-signal" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.role}</p>
                      <p className="text-xs text-muted-foreground">Niveau d&apos;accès</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role === "Super Admin" && (
                      <>
                        <Badge variant="info">Tous les accès</Badge>
                        <Badge variant="success">Gestion utilisateurs</Badge>
                        <Badge variant="warning">Paramètres système</Badge>
                      </>
                    )}
                    {user.role === "Gérant" && (
                      <>
                        <Badge variant="info">Gestion stock</Badge>
                        <Badge variant="success">Rapports</Badge>
                        <Badge variant="warning">Paramètres</Badge>
                      </>
                    )}
                    {user.role === "Caissier" && (
                      <>
                        <Badge variant="info">Point de vente</Badge>
                        <Badge variant="success">Clients</Badge>
                      </>
                    )}
                    {user.role === "Responsable Stock" && (
                      <>
                        <Badge variant="info">Gestion stock</Badge>
                        <Badge variant="success">Fournisseurs</Badge>
                        <Badge variant="warning">Achats</Badge>
                      </>
                    )}
                    {user.role === "Comptable" && (
                      <>
                        <Badge variant="info">Facturation</Badge>
                        <Badge variant="success">Rapports</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Sécurité */}
          {activeSection === "securite" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Sécurité du compte
              </h2>

              {/* Changement de mot de passe */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-stockpro-stock-low-bg dark:bg-stockpro-stock-low-fg/12">
                      <Lock className="w-5 h-5 text-stockpro-stock-low-fg" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Mot de passe</p>
                      <p className="text-sm text-muted-foreground">
                        Dernière modification: il y a 30 jours
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => passwordModal.open()}>
                    Modifier
                  </Button>
                </div>
              </div>

              {/* Authentification à deux facteurs */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${twoFAEnabled ? "bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/12" : "bg-muted"}`}>
                      <Smartphone className={`w-5 h-5 ${twoFAEnabled ? "text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Authentification à deux facteurs
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {twoFAEnabled ? "Activée - Votre compte est protégé" : "Sécurité renforcée pour votre compte"}
                      </p>
                    </div>
                  </div>
                  {twoFAEnabled ? (
                    <Badge variant="success" className="mr-2">Activée</Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => twoFAModal.open()}
                    >
                      Activer
                    </Button>
                  )}
                </div>
              </div>

              {/* Sessions actives */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Sessions actives
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-stockpro-signal rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Chrome sur Windows
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Bamako, Mali • Session actuelle
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Safari sur iPhone
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Bamako, Mali • Il y a 2 heures
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-stockpro-stock-error-fg">
                      Déconnecter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Zone de danger */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-stockpro-stock-error-fg mb-3">
                  Zone de danger
                </h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir vous déconnecter de toutes les sessions ?")) {
                      showToast("Toutes les sessions ont été déconnectées", "success");
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnecter toutes les sessions
                </Button>
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Préférences de notifications
              </h2>

              <div className="space-y-4">
                {[
                  { id: "emailAlerts", label: "Alertes par email", description: "Recevoir les alertes importantes par email", icon: Mail },
                  { id: "stockAlerts", label: "Alertes de stock", description: "Notifications quand le stock est bas", icon: AlertTriangle },
                  { id: "salesReports", label: "Rapports de ventes", description: "Rapports quotidiens des ventes", icon: BarChart3 },
                  { id: "newClients", label: "Nouveaux clients", description: "Notification lors de l'inscription d'un client", icon: Users },
                  { id: "weeklyDigest", label: "Résumé hebdomadaire", description: "Synthèse de l'activité chaque semaine", icon: Calendar },
                ].map((item) => {
                  const Icon = item.icon;
                  const isEnabled = notifications[item.id as keyof typeof notifications];
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.id]: !isEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? "bg-stockpro-signal" : "bg-muted"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Activité */}
          {activeSection === "activite" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Activité récente
              </h2>

              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" className="w-full" onClick={() => {
                const headers = "Action,Date\n";
                const rows = recentActivity.map(a =>
                  `"${a.action}","${a.date}"`
                ).join("\n");
                downloadCsvFile(`historique_activite_${new Date().toISOString().split("T")[0]}.csv`, headers + rows);
                showToast("Historique exporté avec succès !", "success");
              }}>
                <Download className="w-4 h-4 mr-2" />
                Exporter l&apos;historique complet
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Modal changement de mot de passe */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={closePasswordModal}
        title="Changer le mot de passe"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Mot de passe actuel
            </label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              error={passwordErrors.current}
              icon={<Lock className="w-5 h-5" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              error={passwordErrors.new}
              icon={<Lock className="w-5 h-5" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              error={passwordErrors.confirm}
              icon={<Lock className="w-5 h-5" />}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={closePasswordModal}>
              Annuler
            </Button>
            <Button onClick={handleChangePassword}>
              Changer le mot de passe
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Configuration 2FA */}
      <Modal
        isOpen={twoFAModal.isOpen}
        onClose={closeTwoFAModal}
        title="Authentification à deux facteurs"
        size="md"
      >
        <div className="space-y-4">
          {twoFAStep === "setup" ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/10">
                <div className="p-2 rounded-lg bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/12">
                  <Smartphone className="w-6 h-6 text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg" />
                </div>
                <div>
                  <p className="font-medium text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">Protection renforcée</p>
                  <p className="text-sm text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">
                    L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Comment ça fonctionne ?</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-stockpro-navy/10 dark:bg-stockpro-signal/12 flex items-center justify-center text-xs font-medium text-stockpro-navy dark:text-stockpro-signal">1</div>
                    <p className="text-sm text-muted-foreground">Installez une application d'authentification (Google Authenticator, Authy, etc.)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-stockpro-navy/10 dark:bg-stockpro-signal/12 flex items-center justify-center text-xs font-medium text-stockpro-navy dark:text-stockpro-signal">2</div>
                    <p className="text-sm text-muted-foreground">Scannez le code QR ou entrez la clé manuellement</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-stockpro-navy/10 dark:bg-stockpro-signal/12 flex items-center justify-center text-xs font-medium text-stockpro-navy dark:text-stockpro-signal">3</div>
                    <p className="text-sm text-muted-foreground">Entrez le code à 6 chiffres pour confirmer</p>
                  </div>
                </div>
              </div>

              {/* QR Code simulé */}
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="w-32 h-32 mx-auto bg-white dark:bg-muted rounded-lg flex items-center justify-center border-2 border-border dark:border-border">
                  <div className="grid grid-cols-5 gap-1 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-4 w-4 rounded-sm ${((i * 17 + 3) % 5 < 2) ? "bg-foreground dark:bg-muted-foreground" : "bg-transparent"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Clé secrète: <span className="font-mono font-medium">JBSWY3DPEHPK3PXP</span>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres affiché dans votre application d'authentification.
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Code de vérification
                </label>
                <Input
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={closeTwoFAModal}>
              Annuler
            </Button>
            {twoFAStep === "setup" ? (
              <Button onClick={() => setTwoFAStep("verify")}>
                Continuer
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (twoFACode.length === 6) {
                    setTwoFAEnabled(true);
                    closeTwoFAModal();
                    showToast("Authentification à deux facteurs activée !", "success");
                  } else {
                    showToast("Veuillez entrer un code à 6 chiffres", "error");
                  }
                }}
              >
                Activer
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};