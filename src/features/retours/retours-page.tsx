"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Boxes,
  X,
  Eye,
  Plus,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  RefreshCw,
  Wallet,
  AlertCircle,
  Check,
  Printer,
} from "lucide-react";
import {
  MOTIFS_RETOUR,
  STATUTS_RETOUR,
} from "@/data/stock-mock";
import { formatCurrency, formatShortCurrency } from "@/lib/format";
import { loadJsPdf } from "@/lib/pdf";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";
import { InventoryService } from "@/services/inventory.service";
import { ClientService } from "@/services/partner.service";
import { ProductService } from "@/services/product.service";
import { Return } from "@/models/inventory.model";
import { Client } from "@/models/partner.model";
import { Product } from "@/models/product.model";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

export const RetoursPage: React.FC = () => {
  const { user } = useAppShellSession();
  const [retours, setRetours] = useState<Return[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStatut, setFilterStatut] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  
  const newRetourModal = useDisclosure();
  const retourDetailsModal = useDisclosure();
  const processRetourModal = useDisclosure();
  const printRetourModal = useDisclosure();
  
  const [selectedRetour, setSelectedRetour] = useState<Return | null>(null);
  const [exchangeProduct, setExchangeProduct] = useState("");
  const [exchangeQuantity, setExchangeQuantity] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [r, c, p] = await Promise.all([
        InventoryService.getAllReturns(),
        ClientService.getAll(),
        ProductService.getAll()
      ]);
      setRetours(r);
      setClients(c);
      setProducts(p);
    } catch (error) {
      showToast("Erreur lors du chargement", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const [newRetourState, setNewRetourState] = useState({
    client_id: "",
    product_id: "",
    quantite: 1,
    prix_unitaire: 0,
    type: "retour" as const,
    motif_id: "",
    motif_description: "",
    notes: ""
  });

  const stats = useMemo(() => {
    const total = retours.length;
    const enAttente = retours.filter(r => r.statut === "en_attente" || r.statut === "demande").length;
    const valides = retours.filter(r => ["valide", "rembourse", "echange"].includes(r.statut)).length;
    const montantRembourse = retours.filter(r => r.statut === "rembourse").reduce((sum, r) => sum + (r.montant_rembourse || 0), 0);
    const montantEnAttente = retours.filter(r => r.statut === "en_attente" || r.statut === "demande").reduce((sum, r) => sum + r.montant_total, 0);
    return { total, enAttente, valides, montantRembourse, montantEnAttente };
  }, [retours]);

  const filteredRetours = useMemo(() => {
    let result = [...retours];
    if (filterStatut) result = result.filter(r => r.statut === filterStatut);
    if (filterType) result = result.filter(r => r.type === filterType);
    return result;
  }, [retours, filterStatut, filterType]);

  const handleCreateRetour = async () => {
    if (!newRetourState.client_id || !newRetourState.product_id) {
      showToast("Veuillez remplir les champs obligatoires", "error");
      return;
    }
    try {
      const product = products.find(p => p.id.toString() === newRetourState.product_id);
      await InventoryService.createReturn({
        client_id: parseInt(newRetourState.client_id),
        product_id: parseInt(newRetourState.product_id),
        quantite: newRetourState.quantite,
        prix_unitaire: newRetourState.prix_unitaire || product?.prix_vente || 0,
        montant_total: newRetourState.quantite * (newRetourState.prix_unitaire || product?.prix_vente || 0),
        type: newRetourState.type,
        motif_id: newRetourState.motif_id,
        motif_description: newRetourState.motif_description,
        statut: 'demande',
        date_validation: null,
        product_echange_id: null,
        montant_rembourse: 0,
        processed_by: null,
        notes: newRetourState.notes
      });
      showToast("Demande de retour créée", "success");
      newRetourModal.close();
      loadData();
    } catch (error) {
      showToast("Erreur lors de la création", "error");
    }
  };

  const handleProcessRetour = async (action: "valider" | "refuser" | "rembourser" | "echanger") => {
    if (!selectedRetour || !user) return;
    try {
      let status: Return['statut'] = 'demande';
      if (action === "valider") status = "valide";
      else if (action === "refuser") status = "refuse";
      else if (action === "rembourser") status = "rembourse";
      else if (action === "echanger") status = "echange";
      
      await InventoryService.updateReturnStatut(selectedRetour.id, status, user.id.toString());
      showToast(`Retour ${action} avec succès`, "success");
      processRetourModal.close();
      loadData();
    } catch (error) {
      showToast("Erreur lors du traitement", "error");
    }
  };

  // Colonnes du tableau
  const columns = [
    { key: "id", label: "N° Retour", sortable: true },
    { key: "dateDemande", label: "Date", sortable: true },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <p className="font-medium text-foreground">{String(value)}</p>
          <p className="text-xs text-muted-foreground">{String(row.clientTelephone)}</p>
        </div>
      )
    },
    {
      key: "produit",
      label: "Produit",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <p className="font-medium text-foreground">{String(value)}</p>
          <p className="text-xs text-muted-foreground">SKU: {String(row.produitSku)} • Qté: {String(row.quantite)}</p>
        </div>
      )
    },
    {
      key: "motif",
      label: "Motif",
      sortable: true,
      render: (value: unknown) => {
        const motif = MOTIFS_RETOUR.find(m => m.id === value);
        return (
          <div className="max-w-[150px]">
            <Badge variant="outline" className="text-xs truncate">
              {motif?.label || String(value)}
            </Badge>
          </div>
        );
      }
    },
    {
      key: "montantTotal",
      label: "Montant",
      sortable: true,
      render: (value: unknown) => (
        <span className="font-semibold text-foreground">{formatCurrency(value as number)}</span>
      )
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: unknown) => (
        <Badge variant={value === "retour" ? "warning" : "info"}>
          {value === "retour" ? "Retour" : "Échange"}
        </Badge>
      )
    },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (value: unknown) => {
        const statut = STATUTS_RETOUR[value as keyof typeof STATUTS_RETOUR];
        const variantMap: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
          amber: "warning",
          sky: "info",
          emerald: "success",
          violet: "success",
          indigo: "info",
          rose: "danger",
          slate: "default"
        };
        return (
          <Badge variant={variantMap[statut?.color || "slate"]}>
            {statut?.label || String(value)}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-navy dark:text-stockpro-signal hover:bg-stockpro-navy/8 dark:hover:bg-stockpro-signal/10"
            title="Voir détails"
            onClick={() => {
              const retour = retours.find(r => r.id === row.id);
              if (retour) {
                setSelectedRetour(retour);
                retourDetailsModal.open();
              }
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
          {(row.statut === "demande" || row.statut === "en_attente") && (
            <button
              className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-ok-fg hover:bg-stockpro-stock-ok-bg dark:hover:bg-stockpro-stock-ok-fg/10"
              title="Traiter"
              onClick={() => {
                const retour = retours.find(r => r.id === row.id);
                if (retour) {
                  setSelectedRetour(retour);
                  processRetourModal.open();
                }
              }}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(row.statut === "valide" || row.statut === "rembourse" || row.statut === "echange") && (
            <button
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Imprimer"
              onClick={() => {
                const retour = retours.find(r => r.id === row.id);
                if (retour) {
                  setSelectedRetour(retour);
                  printRetourModal.open();
                }
              }}
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Retours & Échanges</h2>
          <p className="text-muted-foreground">Gérez les retours et échanges de produits</p>
        </div>
        <Button onClick={() => newRetourModal.open()}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle demande
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total demandes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-low-fg">{stats.enAttente}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-ok-fg">{stats.valides}</p>
          <p className="text-xs text-muted-foreground">Traitées</p>
        </Card>
        <Card className="text-center">
          <p className="text-xl font-bold text-stockpro-navy dark:text-stockpro-signal">{formatShortCurrency(stats.montantRembourse)}</p>
          <p className="text-xs text-muted-foreground">Remboursé (FCFA)</p>
        </Card>
        <Card className="text-center">
          <p className="text-xl font-bold text-stockpro-stock-error-fg">{formatShortCurrency(stats.montantEnAttente)}</p>
          <p className="text-xs text-muted-foreground">En attente (FCFA)</p>
        </Card>
      </div>

      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select
            value={filterStatut}
            onChange={setFilterStatut}
            placeholder="Tous les statuts"
            options={Object.entries(STATUTS_RETOUR).map(([key, val]) => ({ value: key, label: val.label }))}
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            placeholder="Tous les types"
            options={[{ value: "retour", label: "Retour" }, { value: "echange", label: "Échange" }]}
          />
        </div>
      </Card>

      <DataTable onToast={showToast}
        columns={columns}
        data={filteredRetours}
        title="Liste des retours"
        pageSize={5}
        isLoading={isLoading}
        actions={(row) => {
          const retour = retours.find(r => r.id === row.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <button className="p-1.5 hover:bg-muted rounded" onClick={() => { setSelectedRetour(retour || null); retourDetailsModal.open(); }}><Eye className="w-4 h-4" /></button>
              {(row.statut === "demande" || row.statut === "en_attente") && (
                <button className="p-1.5 hover:bg-stockpro-stock-ok-bg rounded text-stockpro-stock-ok-fg" onClick={() => { setSelectedRetour(retour || null); processRetourModal.open(); }}><CheckCircle className="w-4 h-4" /></button>
              )}
            </div>
          );
        }}
      />

      <Modal isOpen={newRetourModal.isOpen} onClose={newRetourModal.close} title="Nouvelle demande" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateRetour(); }}>
          <div className="grid grid-cols-2 gap-4">
            <Select value={newRetourState.client_id} onChange={(v) => setNewRetourState({ ...newRetourState, client_id: v })} options={clients.map(c => ({ value: String(c.id), label: c.nom }))} placeholder="Client" />
            <Select value={newRetourState.product_id} onChange={(v) => setNewRetourState({ ...newRetourState, product_id: v })} options={products.map(p => ({ value: String(p.id), label: p.nom }))} placeholder="Produit" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input type="number" value={String(newRetourState.quantite)} onChange={(e) => setNewRetourState({ ...newRetourState, quantite: parseInt(e.target.value) || 1 })} placeholder="Qté" />
            <Select value={newRetourState.type} onChange={(v) => setNewRetourState({ ...newRetourState, type: v as any })} options={[{ value: "retour", label: "Retour" }, { value: "echange", label: "Échange" }]} />
            <Select value={newRetourState.motif_id} onChange={(v) => setNewRetourState({ ...newRetourState, motif_id: v })} options={MOTIFS_RETOUR.map(m => ({ value: m.id, label: m.label }))} placeholder="Motif" />
          </div>
          <textarea className="w-full p-2 border rounded" placeholder="Description..." value={newRetourState.motif_description} onChange={(e) => setNewRetourState({ ...newRetourState, motif_description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={newRetourModal.close}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={retourDetailsModal.isOpen} onClose={retourDetailsModal.close} title="Détails du retour">
        {selectedRetour && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="font-semibold">{selectedRetour.client?.nom || "Inconnu"}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">Produit: {selectedRetour.product?.nom}</p>
              <p className="text-sm">Quantité: {selectedRetour.quantite}</p>
              <p className="text-sm font-bold">Total: {formatCurrency(selectedRetour.montant_total)}</p>
            </div>
            <div className="flex justify-end pt-4"><Button variant="outline" onClick={retourDetailsModal.close}>Fermer</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

      {/* Modal Nouveau Retour */}
      <Modal
        isOpen={newRetourModal.isOpen}
        onClose={newRetourModal.close}
        title="Nouvelle demande de retour"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Client *</label>
              <Select
                value={newRetour.client}
                onChange={(v) => {
                  const client = MOCK_CLIENTS.find(c => c.nom === v);
                  setNewRetour({
                    ...newRetour,
                    client: v,
                    clientTelephone: client?.telephone || ""
                  });
                }}
                placeholder="Sélectionner un client"
                options={MOCK_CLIENTS.map(c => ({ value: c.nom, label: c.nom }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Produit *</label>
              <Select
                value={newRetour.produit}
                onChange={(v) => {
                  const produit = MOCK_PRODUCTS.find(p => p.nom === v);
                  setNewRetour({
                    ...newRetour,
                    produit: v,
                    produitSku: produit?.sku || "",
                    prixUnitaire: produit?.prixVente || 0
                  });
                }}
                placeholder="Sélectionner un produit"
                options={MOCK_PRODUCTS.map(p => ({ value: p.nom, label: `${p.nom} (${p.sku})` }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantité *</label>
              <Input
                type="number"
                min="1"
                value={String(newRetour.quantite)}
                onChange={(e) => setNewRetour({ ...newRetour, quantite: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix unitaire</label>
              <Input
                type="number"
                value={String(newRetour.prixUnitaire)}
                onChange={(e) => setNewRetour({ ...newRetour, prixUnitaire: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
              <Select
                value={newRetour.type}
                onChange={(v) => setNewRetour({ ...newRetour, type: v })}
                options={[
                  { value: "retour", label: "Retour simple (remboursement)" },
                  { value: "echange", label: "Échange" }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Motif *</label>
              <Select
                value={newRetour.motif}
                onChange={(v) => setNewRetour({ ...newRetour, motif: v })}
                placeholder="Sélectionner un motif"
                options={MOTIFS_RETOUR.map(m => ({ value: m.id, label: m.label }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Montant total</label>
              <div className="h-10 px-3 py-2 bg-muted rounded-lg flex items-center">
                <span className="font-semibold text-foreground">
                  {formatCurrency(newRetour.quantite * newRetour.prixUnitaire)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description du motif</label>
            <textarea
              className="w-full h-20 px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-stockpro-signal focus:border-transparent"
              placeholder="Décrivez la raison du retour..."
              value={newRetour.motifDescription}
              onChange={(e) => setNewRetour({ ...newRetour, motifDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes internes</label>
            <textarea
              className="w-full h-16 px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-stockpro-signal focus:border-transparent"
              placeholder="Notes pour le traitement..."
              value={newRetour.notes}
              onChange={(e) => setNewRetour({ ...newRetour, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={newRetourModal.close}>Annuler</Button>
            <Button onClick={handleNewRetour}>
              <Check className="w-4 h-4 mr-2" />
              Créer la demande
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Détails */}
      <Modal
        isOpen={retourDetailsModal.isOpen}
        onClose={closeRetourDetailsModal}
        title={`Détails du retour ${selectedRetour?.id || ""}`}
        size="lg"
      >
        {selectedRetour && (
          <div className="space-y-4">
            {/* Info générale */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Client</p>
                <p className="font-semibold text-foreground">{selectedRetour.client}</p>
                <p className="text-sm text-muted-foreground">{selectedRetour.clientTelephone}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Statut</p>
                <Badge variant={selectedRetour.statut === "rembourse" || selectedRetour.statut === "echange" || selectedRetour.statut === "valide" ? "success" : selectedRetour.statut === "refuse" ? "danger" : "warning"}>
                  {STATUTS_RETOUR[selectedRetour.statut as keyof typeof STATUTS_RETOUR]?.label}
                </Badge>
              </div>
            </div>

            {/* Produit retourné */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produit retourné
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Produit</p>
                  <p className="font-medium text-foreground">{selectedRetour.produit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">SKU</p>
                  <p className="font-medium text-foreground">{selectedRetour.produitSku}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantité</p>
                  <p className="font-medium text-foreground">{selectedRetour.quantite}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant</p>
                  <p className="font-medium text-foreground">{formatCurrency(selectedRetour.montantTotal)}</p>
                </div>
              </div>
            </div>

            {/* Motif */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Motif du retour
              </h4>
              <Badge variant="outline" className="mb-2">
                {MOTIFS_RETOUR.find(m => m.id === selectedRetour.motif)?.label || selectedRetour.motif}
              </Badge>
              <p className="text-sm text-muted-foreground">{selectedRetour.motifDescription}</p>
            </div>

            {/* Produit échangé (si applicable) */}
            {selectedRetour.produitEchange && (
              <div className="p-4 rounded-lg border border-stockpro-navy/20 bg-stockpro-navy/5 dark:border-stockpro-signal/25 dark:bg-stockpro-signal/8">
                <h4 className="font-semibold text-stockpro-navy dark:text-stockpro-signal mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Produit d'échange
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Produit</p>
                    <p className="font-medium text-foreground">{selectedRetour.produitEchange.nom}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SKU</p>
                    <p className="font-medium text-foreground">{selectedRetour.produitEchange.sku}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantité</p>
                    <p className="font-medium text-foreground">{selectedRetour.produitEchange.quantite}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prix</p>
                    <p className="font-medium text-foreground">{formatCurrency(selectedRetour.produitEchange.prix)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Montant remboursé */}
            {selectedRetour.montantRembourse > 0 && (
              <div className="p-4 rounded-lg bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/10">
                <p className="text-sm text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">Montant remboursé</p>
                <p className="text-2xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{formatCurrency(selectedRetour.montantRembourse)}</p>
              </div>
            )}

            {/* Notes */}
            {selectedRetour.notes && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{selectedRetour.notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="flex justify-between text-sm text-muted-foreground pt-4 border-t border-border">
              <span>Demande: {selectedRetour.dateDemande}</span>
              {selectedRetour.dateValidation && <span>Traitement: {selectedRetour.dateValidation}</span>}
              {selectedRetour.processedBy && <span>Par: {selectedRetour.processedBy}</span>}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Traitement */}
      <Modal
        isOpen={processRetourModal.isOpen}
        onClose={closeProcessRetourModal}
        title={`Traiter le retour ${selectedRetour?.id || ""}`}
        size="lg"
      >
        {selectedRetour && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg flex bg-stockpro-stock-low-bg dark:bg-stockpro-stock-low-fg/10 items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-stockpro-stock-low-fg flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-stockpro-stock-low-fg">Action de traitement</p>
                <p className="text-sm text-stockpro-stock-low-fg">
                  Choisissez l'action à effectuer pour ce retour. Cette action mettra à jour le stock automatiquement.
                </p>
              </div>
            </div>

            {/* Résumé */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="font-medium">{selectedRetour.client}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Produit</p>
                <p className="font-medium">{selectedRetour.produit} (x{selectedRetour.quantite})</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Montant</p>
                <p className="font-medium">{formatCurrency(selectedRetour.montantTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Motif</p>
                <p className="font-medium">{MOTIFS_RETOUR.find(m => m.id === selectedRetour.motif)?.label}</p>
              </div>
            </div>

            {/* Options d'échange */}
            {selectedRetour.type === "echange" && (
              <div className="p-4 rounded-lg border border-stockpro-navy/20 dark:border-stockpro-signal/25">
                <h4 className="font-semibold text-foreground mb-3">Produit d'échange</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Produit de remplacement</label>
                    <Select
                      value={exchangeProduct}
                      onChange={setExchangeProduct}
                      placeholder="Sélectionner un produit"
                      options={MOCK_PRODUCTS.filter(p => p.nom !== selectedRetour.produit).map(p => ({
                        value: p.nom,
                        label: `${p.nom} - ${formatCurrency(p.prixVente)}`
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Quantité</label>
                    <Input
                      type="number"
                      min="1"
                      value={String(exchangeQuantity)}
                      onChange={(e) => setExchangeQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Impact sur le stock */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Boxes className="w-4 h-4" />
                Impact sur le stock
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock actuel ({selectedRetour.produitSku})</span>
                  <span className="font-medium">{MOCK_PRODUCTS.find(p => p.sku === selectedRetour.produitSku)?.stock || 0} unités</span>
                </div>
                <div className="flex justify-between text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">
                  <span>+ Retour en stock</span>
                  <span className="font-medium">+{selectedRetour.quantite} unités</span>
                </div>
                {selectedRetour.type === "echange" && exchangeProduct && (
                  <div className="flex justify-between text-stockpro-stock-error-fg">
                    <span>- Sortie échange ({exchangeProduct})</span>
                    <span className="font-medium">-{exchangeQuantity} unités</span>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
              <Button
                variant="success"
                onClick={() => handleProcessRetour("valider")}
                className="flex-col py-3"
              >
                <CheckCircle className="w-5 h-5 mb-1" />
                Valider
              </Button>
              <Button
                variant="primary"
                onClick={() => handleProcessRetour("rembourser")}
                className="flex-col py-3"
              >
                <Wallet className="w-5 h-5 mb-1" />
                Rembourser
              </Button>
              {selectedRetour.type === "echange" && (
                <Button
                  variant="outline"
                  onClick={() => handleProcessRetour("echanger")}
                  className="flex-col py-3"
                  disabled={!exchangeProduct}
                >
                  <RefreshCw className="w-5 h-5 mb-1" />
                  Échanger
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => handleProcessRetour("refuser")}
                className="flex-col py-3"
              >
                <X className="w-5 h-5 mb-1" />
                Refuser
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Impression */}
      <Modal
        isOpen={printRetourModal.isOpen}
        onClose={closePrintRetourModal}
        title={`Reçu de retour ${selectedRetour?.id || ""}`}
        size="md"
      >
        {selectedRetour && (
          <div className="space-y-4">
            {/* En-tête */}
            <div className="text-center pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">StockPro Manager</h3>
              <p className="text-sm text-muted-foreground">Reçu de Retour / Échange</p>
            </div>

            {/* Informations */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">N° Retour</p>
                <p className="font-semibold text-foreground">{selectedRetour.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">{selectedRetour.dateDemande}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Client</p>
                <p className="font-semibold text-foreground">{selectedRetour.client}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Téléphone</p>
                <p className="font-semibold text-foreground">{selectedRetour.clientTelephone}</p>
              </div>
            </div>

            {/* Produit */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Produit retourné</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Produit: </span>
                  <span className="font-medium text-foreground">{selectedRetour.produit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SKU: </span>
                  <span className="font-medium text-foreground">{selectedRetour.produitSku}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantité: </span>
                  <span className="font-medium text-foreground">{selectedRetour.quantite}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Montant: </span>
                  <span className="font-medium text-foreground">{formatCurrency(selectedRetour.montantTotal)}</span>
                </div>
              </div>
            </div>

            {/* Motif */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-1">Motif</h4>
              <p className="text-sm text-muted-foreground">
                {MOTIFS_RETOUR.find(m => m.id === selectedRetour.motif)?.label || selectedRetour.motif}
              </p>
              {selectedRetour.motifDescription && (
                <p className="text-xs text-muted-foreground mt-1">{selectedRetour.motifDescription}</p>
              )}
            </div>

            {/* Résolution */}
            <div className="p-4 rounded-lg bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/10">
              <h4 className="font-semibold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg mb-2">Résolution</h4>
              <div className="flex items-center gap-2">
                <Badge variant="success">
                  {STATUTS_RETOUR[selectedRetour.statut as keyof typeof STATUTS_RETOUR]?.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  le {selectedRetour.dateValidation}
                </span>
              </div>
              {selectedRetour.montantRembourse > 0 && (
                <p className="text-lg font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg mt-2">
                  Remboursé: {formatCurrency(selectedRetour.montantRembourse)}
                </p>
              )}
              {selectedRetour.produitEchange && (
                <p className="text-sm text-muted-foreground mt-2">
                  Échangé contre: {selectedRetour.produitEchange.nom} (x{selectedRetour.produitEchange.quantite})
                </p>
              )}
            </div>

            {/* Traité par */}
            {selectedRetour.processedBy && (
              <p className="text-xs text-muted-foreground text-center">
                Traité par: {selectedRetour.processedBy}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={closePrintRetourModal}>
                Fermer
              </Button>
              <Button onClick={async () => {
                const jsPDF = await loadJsPdf();
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text("StockPro Manager - Recu de Retour", 20, 20);
                doc.setFontSize(12);
                doc.text(`N Retour: ${selectedRetour.id}`, 20, 35);
                doc.text(`Date: ${selectedRetour.dateDemande}`, 20, 42);
                doc.text(`Client: ${selectedRetour.client}`, 20, 49);
                doc.text(`Produit: ${selectedRetour.produit}`, 20, 56);
                doc.text(`Montant: ${formatCurrency(selectedRetour.montantTotal)}`, 20, 63);
                doc.text(`Statut: ${STATUTS_RETOUR[selectedRetour.statut as keyof typeof STATUTS_RETOUR]?.label}`, 20, 70);
                if (selectedRetour.montantRembourse > 0) {
                  doc.text(`Rembourse: ${formatCurrency(selectedRetour.montantRembourse)}`, 20, 77);
                }
                doc.save(`retour_${selectedRetour.id}.pdf`);
                showToast("PDF généré avec succès", "success");
              }}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};