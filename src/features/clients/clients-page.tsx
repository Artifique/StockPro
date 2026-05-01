"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  Eye,
  Edit,
  Plus,
  Mail,
  Send,
  Phone,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select, Avatar } from "@/components/stock-pro/primitives";
import { ClientService } from "@/services/partner.service";
import { Client } from "@/models/partner.model";

export const ClientsPage: React.FC = () => {
  const clientDrawer = useDisclosure();
  const newClientModal = useDisclosure();
  const editClientModal = useDisclosure();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [editClientData, setEditClientData] = useState<Partial<Client>>({});

  // Form states for new client
  const [newClientNom, setNewClientNom] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientType, setNewClientType] = useState<Client['type']>("Particulier");
  const [newClientAdresse, setNewClientAdresse] = useState("");
  const [newClientNewsletter, setNewClientNewsletter] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await ClientService.getAll();
      setClients(data);
    } catch (error) {
      showToast("Erreur lors du chargement des clients", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = clients.length;
    const vip = clients.filter((c) => c.type === "VIP").length;
    const creances = clients.filter((c) => c.solde < 0).reduce((sum, c) => sum + Math.abs(c.solde), 0);
    const nouveaux = clients.filter(c => {
      const date = c.created_at ? new Date(c.created_at) : new Date();
      return date.getMonth() === new Date().getMonth();
    }).length;
    return { total, vip, creances, nouveaux };
  }, [clients]);

  // Filter clients based on search and type
  const filteredClients = useMemo(() => {
    let result = [...clients];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.nom.toLowerCase().includes(query) ||
        (c.email?.toLowerCase().includes(query)) ||
        (c.telephone?.includes(query))
      );
    }
    if (selectedType) {
      result = result.filter((c) => c.type === selectedType);
    }
    return result;
  }, [clients, searchQuery, selectedType]);

  const columns = [
    {
      key: "nom",
      label: "Client",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <Avatar initials={String(value).split(" ").map((n) => n[0]).join("").slice(0, 2)} color="#1a2b6d" size="sm" />
          <div>
            <p className="font-medium text-foreground">{String(value)}</p>
            <p className="text-xs text-muted-foreground">{String(row.email || "")}</p>
          </div>
        </div>
      ),
    },
    { key: "telephone", label: "Téléphone", sortable: true },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: unknown) => {
        const typeStyles: Record<string, string> = {
          VIP: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
          Grossiste: "bg-stockpro-navy/10 text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal",
          Détaillant: "bg-stockpro-navy/8 text-stockpro-navy-mid dark:bg-stockpro-signal/10 dark:text-stockpro-signal",
          Particulier: "bg-muted text-foreground",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyles[String(value)] || ""}`}>
            {String(value)}
          </span>
        );
      },
    },
    {
      key: "solde",
      label: "Solde",
      sortable: true,
      render: (value: unknown) => {
        const solde = value as number;
        const color = solde >= 0 ? "text-stockpro-stock-ok-fg" : "text-stockpro-stock-error-fg";
        return <span className={`font-semibold ${color}`}>{solde >= 0 ? "+" : ""}{formatCurrency(solde)}</span>;
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
  ];

  const viewClientDetails = (client: Client) => {
    setSelectedClient(client);
    clientDrawer.open();
  };

  const handleCreateClient = async () => {
    try {
      await ClientService.create({
        nom: newClientNom,
        telephone: newClientPhone,
        email: newClientEmail,
        type: newClientType,
        adresse: newClientAdresse,
        newsletter_opt_in: newClientNewsletter,
        solde: 0,
        statut: 'actif'
      });
      showToast("Client créé avec succès !", "success");
      newClientModal.close();
      loadClients();
    } catch (error) {
      showToast("Erreur lors de la création", "error");
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    try {
      await ClientService.update(selectedClient.id, editClientData);
      showToast(`Client "${editClientData.nom}" modifié avec succès`, "success");
      editClientModal.close();
      loadClients();
    } catch (error) {
      showToast("Erreur lors de la modification", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Clients</h2>
          <p className="text-muted-foreground">Gérez votre base de clients</p>
        </div>
        <Button onClick={() => newClientModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total clients</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.vip}</p>
          <p className="text-sm text-muted-foreground">Clients VIP</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-error-fg">{formatCurrency(stats.creances)}</p>
          <p className="text-sm text-muted-foreground">Créances totales</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{stats.nouveaux}</p>
          <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Tous les types"
              options={[
                { value: "VIP", label: "VIP" },
                { value: "Grossiste", label: "Grossiste" },
                { value: "Détaillant", label: "Détaillant" },
                { value: "Particulier", label: "Particulier" },
              ]}
            />
          </div>
          {(searchQuery || selectedType) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("");
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
        {(searchQuery || selectedType) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
            <span>{filteredClients.length} client{filteredClients.length > 1 ? "s" : ""} trouvé{filteredClients.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </Card>

      {/* Clients Table */}
      <DataTable onToast={showToast}
        columns={columns}
        data={filteredClients}
        title="Liste des clients"
        pageSize={5}
        emptyMessage={
          searchQuery || selectedType
            ? "Aucun client ne correspond à votre recherche"
            : "Aucun client enregistré"
        }
        actions={(row) => {
          const client = MOCK_CLIENTS.find((c) => c.nom === row.nom);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => viewClientDetails(client!)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-navy dark:text-stockpro-signal hover:bg-stockpro-navy/8 dark:hover:bg-stockpro-signal/10"
                title="Voir la fiche client"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Modifier le client"
                onClick={() => {
                  if (client) {
                    setSelectedClient(client);
                    setEditClientData({
                      nom: client.nom,
                      telephone: client.telephone,
                      email: client.email,
                      type: client.type,
                    });
                    editClientModal.open();
                  }
                }}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-ok-fg hover:bg-stockpro-stock-ok-bg dark:hover:bg-stockpro-stock-ok-fg/10"
                title="Envoyer un SMS"
                onClick={() => showToast(`SMS envoyé à ${row.nom}`, "success")}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          );
        }}
      />

      {/* Client Details Drawer */}
      {clientDrawer.isOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => clientDrawer.close()} />
          <div className="relative w-full max-w-md bg-card shadow-xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Fiche client</h3>
              <button onClick={() => clientDrawer.close()} className="p-2 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="text-center">
                <Avatar initials={selectedClient.nom.split(" ").map((n) => n[0]).join("").slice(0, 2)} color="#1a2b6d" size="lg" className="mx-auto" />
                <h4 className="mt-3 text-xl font-semibold text-foreground">{selectedClient.nom}</h4>
                <p className="text-muted-foreground">{selectedClient.type}</p>
                <Badge variant={selectedClient.type === "VIP" ? "warning" : "default"} className="mt-2">
                  {selectedClient.type}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{selectedClient.telephone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{selectedClient.email}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card padding="sm" className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedClient.caTotal)}</p>
                  <p className="text-xs text-muted-foreground">CA Total</p>
                </Card>
                <Card padding="sm" className="text-center">
                  <p className={`text-2xl font-bold ${selectedClient.solde >= 0 ? "text-stockpro-stock-ok-fg" : "text-stockpro-stock-error-fg"}`}>
                    {formatCurrency(selectedClient.solde)}
                  </p>
                  <p className="text-xs text-muted-foreground">Solde</p>
                </Card>
              </div>

              {/* Recent Orders */}
              <div>
                <h5 className="font-medium text-foreground mb-3">Dernières ventes</h5>
                <div className="space-y-2">
                  {MOCK_TRANSACTIONS.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.produit}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <p className="font-semibold text-foreground">{formatCurrency(t.montant)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => showToast(`Appel vers ${selectedClient.telephone}`, "info")}>
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
                <Button className="flex-1" onClick={() => showToast(`SMS envoyé à ${selectedClient.nom}`, "success")}>
                  <Send className="w-4 h-4 mr-2" />
                  SMS
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      <Modal isOpen={newClientModal.isOpen} onClose={() => newClientModal.close()} title="Nouveau client" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Client créé avec succès !", "success");
            newClientModal.close();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nom complet <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input placeholder="Ex: Amadou Koné" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Téléphone <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input placeholder="+223 70 00 00 00" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email <span className="text-muted-foreground text-xs">(optionnel)</span>
              </label>
              <Input type="email" placeholder="email@exemple.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type de client <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Select
                value=""
                onChange={() => { }}
                options={[
                  { value: "particulier", label: "Particulier" },
                  { value: "detaillant", label: "Détaillant" },
                  { value: "grossiste", label: "Grossiste" },
                  { value: "vip", label: "VIP" },
                ]}
                placeholder="Sélectionner le type"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">💡 VIP = client fidèle, Grossiste = achats en gros</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Adresse <span className="text-muted-foreground text-xs">(optionnel)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Adresse complète..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="newsletter" className="w-4 h-4 rounded border-border text-stockpro-navy dark:text-stockpro-signal focus:ring-stockpro-signal" />
            <label htmlFor="newsletter" className="text-sm text-muted-foreground">Envoyer les promotions par SMS</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => newClientModal.close()}>
              Annuler
            </Button>
            <Button type="submit">Créer le client</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={editClientModal.isOpen} onClose={() => editClientModal.close()} title="Modifier le client" size="lg">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast(`Client "${editClientData.nom}" modifié avec succès`, "success");
            editClientModal.close();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
              <Input
                value={editClientData.nom}
                onChange={(e) => setEditClientData({ ...editClientData, nom: e.target.value })}
                placeholder="Nom et prénom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
              <Input
                value={editClientData.telephone}
                onChange={(e) => setEditClientData({ ...editClientData, telephone: e.target.value })}
                placeholder="+223 XX XX XX XX"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input
                type="email"
                value={editClientData.email}
                onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type de client</label>
              <Select
                value={editClientData.type}
                onChange={(v) => setEditClientData({ ...editClientData, type: v })}
                options={[
                  { value: "Particulier", label: "Particulier" },
                  { value: "Détaillant", label: "Détaillant" },
                  { value: "Grossiste", label: "Grossiste" },
                  { value: "VIP", label: "VIP" },
                ]}
                placeholder="Sélectionner"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Notes sur le client..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => editClientModal.close()}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 RAPPORTS PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
