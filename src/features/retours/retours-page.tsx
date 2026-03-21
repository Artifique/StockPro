"use client";

import React, { useState, useMemo } from "react";
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
  LOG_TYPES,
  MOCK_CLIENTS,
  MOCK_PRODUCTS,
  MOCK_RETOURS,
  MOTIFS_RETOUR,
  STATUTS_RETOUR,
} from "@/data/stock-mock";
import { addLogWithCurrentUser } from "@/lib/app-logs";
import { formatCurrency, formatShortCurrency } from "@/lib/format";
import { loadJsPdf } from "@/lib/pdf";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";

type RetourEntry = (typeof MOCK_RETOURS)[number];

export const RetoursPage: React.FC = () => {
  // États
  const [retours, setRetours] = useState<RetourEntry[]>([...MOCK_RETOURS]);
  const [filterStatut, setFilterStatut] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const newRetourModal = useDisclosure();
  const retourDetailsModal = useDisclosure();
  const processRetourModal = useDisclosure();
  const printRetourModal = useDisclosure();
  const [selectedRetour, setSelectedRetour] = useState<RetourEntry | null>(null);

  const closeRetourDetailsModal = () => {
    retourDetailsModal.close();
    setSelectedRetour(null);
  };

  const closeProcessRetourModal = () => {
    processRetourModal.close();
    setSelectedRetour(null);
    setExchangeProduct("");
    setExchangeQuantity(1);
  };

  const closePrintRetourModal = () => {
    printRetourModal.close();
    setSelectedRetour(null);
  };

  // Nouveau retour
  const [newRetour, setNewRetour] = useState({
    client: "",
    clientTelephone: "",
    produit: "",
    produitSku: "",
    quantite: 1,
    prixUnitaire: 0,
    type: "retour",
    motif: "",
    motifDescription: "",
    notes: ""
  });

  // Pour l'échange
  const [exchangeProduct, setExchangeProduct] = useState("");
  const [exchangeQuantity, setExchangeQuantity] = useState(1);

  // Stats
  const stats = useMemo(() => {
    const total = retours.length;
    const enAttente = retours.filter(r => r.statut === "en_attente" || r.statut === "demande").length;
    const valides = retours.filter(r => r.statut === "valide" || r.statut === "rembourse" || r.statut === "echange").length;
    const montantRembourse = retours.filter(r => r.statut === "rembourse").reduce((sum, r) => sum + r.montantRembourse, 0);
    const montantEnAttente = retours.filter(r => r.statut === "en_attente" || r.statut === "demande").reduce((sum, r) => sum + r.montantTotal, 0);
    return { total, enAttente, valides, montantRembourse, montantEnAttente };
  }, [retours]);

  // Filtrage
  const filteredRetours = useMemo(() => {
    let result = retours;
    if (filterStatut) {
      result = result.filter(r => r.statut === filterStatut);
    }
    if (filterType) {
      result = result.filter(r => r.type === filterType);
    }
    if (filterDateFrom) {
      result = result.filter(r => r.dateDemande >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter(r => r.dateDemande <= filterDateTo);
    }
    return result;
  }, [retours, filterStatut, filterType, filterDateFrom, filterDateTo]);

  // Handler nouveau retour
  const handleNewRetour = () => {
    const client = MOCK_CLIENTS.find(c => c.nom === newRetour.client);
    const produit = MOCK_PRODUCTS.find(p => p.nom === newRetour.produit);

    if (!client || !produit) {
      showToast("Veuillez sélectionner un client et un produit valides", "error");
      return;
    }

    const retourId = `RET-2024-${String(retours.length + 1).padStart(3, '0')}`;
    const montantTotal = newRetour.quantite * (newRetour.prixUnitaire || produit.prixVente);

    const nouveauRetour = {
      id: retourId,
      dateDemande: new Date().toISOString().split('T')[0],
      client: newRetour.client,
      clientTelephone: client.telephone,
      produit: newRetour.produit,
      produitSku: produit.sku,
      quantite: newRetour.quantite,
      prixUnitaire: newRetour.prixUnitaire || produit.prixVente,
      montantTotal,
      type: newRetour.type,
      motif: newRetour.motif,
      motifDescription: newRetour.motifDescription,
      statut: "demande",
      dateValidation: null,
      produitEchange: null,
      montantRembourse: 0,
      processedBy: null,
      notes: newRetour.notes
    };

    setRetours([nouveauRetour, ...retours]);
    newRetourModal.close();
    setNewRetour({
      client: "",
      clientTelephone: "",
      produit: "",
      produitSku: "",
      quantite: 1,
      prixUnitaire: 0,
      type: "retour",
      motif: "",
      motifDescription: "",
      notes: ""
    });

    // Log de la demande de retour
    addLogWithCurrentUser("RETURN_CREATE",
      `Demande de retour ${retourId} créée pour ${newRetour.client}`,
      { returnId: retourId, product: newRetour.produit, quantity: newRetour.quantite, reason: MOTIFS_RETOUR.find(m => m.id === newRetour.motif)?.label, type: newRetour.type }
    );

    showToast(`Demande de retour ${retourId} créée avec succès`, "success");
  };

  // Handler validation retour
  const handleProcessRetour = (action: "valider" | "refuser" | "rembourser" | "echanger") => {
    if (!selectedRetour) return;

    const updatedRetours = retours.map(r => {
      if (r.id === selectedRetour.id) {
        const updates: Partial<typeof r> = {
          dateValidation: new Date().toISOString().split('T')[0],
          processedBy: "Utilisateur actuel"
        };

        if (action === "valider") {
          updates.statut = "valide";
        } else if (action === "refuser") {
          updates.statut = "refuse";
        } else if (action === "rembourser") {
          updates.statut = "rembourse";
          updates.montantRembourse = r.montantTotal;
        } else if (action === "echanger") {
          updates.statut = "echange";
          const exchangeProd = MOCK_PRODUCTS.find(p => p.nom === exchangeProduct);
          if (exchangeProd) {
            updates.produitEchange = {
              nom: exchangeProduct,
              sku: exchangeProd.sku,
              prix: exchangeProd.prixVente,
              quantite: exchangeQuantity
            };
          }
        }

        return { ...r, ...updates };
      }
      return r;
    });

    setRetours(updatedRetours as RetourEntry[]);
    processRetourModal.close();
    setSelectedRetour(null);
    setExchangeProduct("");
    setExchangeQuantity(1);

    const messages: Record<string, string> = {
      valider: "validé",
      refuser: "refusé",
      rembourser: "remboursé",
      echanger: "échangé"
    };

    // Log de l'action de traitement
    const logTypes: Record<string, keyof typeof LOG_TYPES> = {
      valider: "RETURN_VALIDATE",
      refuser: "RETURN_REJECT",
      rembourser: "RETURN_REFUND",
      echanger: "RETURN_EXCHANGE"
    };

    addLogWithCurrentUser(logTypes[action],
      `${selectedRetour.id} ${messages[action]}: ${selectedRetour.produit}`,
      {
        returnId: selectedRetour.id,
        action,
        product: selectedRetour.produit,
        amount: action === "rembourser" ? selectedRetour.montantTotal : undefined,
        exchangeProduct: action === "echanger" ? exchangeProduct : undefined
      }
    );

    showToast(`Retour ${selectedRetour.id} ${messages[action]} avec succès`, "success");
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Retours & Échanges</h2>
          <p className="text-muted-foreground">Gérez les retours et échanges de produits</p>
        </div>
        <Button onClick={() => newRetourModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-muted to-muted dark:from-muted dark:to-card rounded-bl-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-muted">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">demandes</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-stockpro-stock-low-bg to-stockpro-stock-low-bg dark:from-stockpro-stock-low-fg/12 dark:to-stockpro-stock-low-fg/8 rounded-bl-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-stockpro-stock-low-bg dark:bg-stockpro-stock-low-fg/12">
                <Clock className="w-4 h-4 text-stockpro-stock-low-fg" />
              </div>
              <span className="text-xs text-muted-foreground">En attente</span>
            </div>
            <p className="text-3xl font-bold text-stockpro-stock-low-fg">{stats.enAttente}</p>
            <p className="text-xs text-muted-foreground">à traiter</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-stockpro-stock-ok-bg to-stockpro-stock-ok-bg dark:from-stockpro-stock-ok-fg/12 dark:to-stockpro-stock-ok-fg/8 rounded-bl-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/12">
                <CheckCircle className="w-4 h-4 text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg" />
              </div>
              <span className="text-xs text-muted-foreground">Traitées</span>
            </div>
            <p className="text-3xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{stats.valides}</p>
            <p className="text-xs text-muted-foreground">terminées</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-stockpro-navy-mid/15 to-stockpro-navy-mid/22 dark:from-stockpro-navy-mid/18 dark:to-stockpro-navy-mid/12 rounded-bl-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-stockpro-navy-mid/12 dark:bg-stockpro-navy-mid/15">
                <Wallet className="w-4 h-4 text-stockpro-navy dark:text-stockpro-signal" />
              </div>
              <span className="text-xs text-muted-foreground">Remboursé</span>
            </div>
            <p className="text-xl font-bold text-stockpro-navy dark:text-stockpro-signal">{formatShortCurrency(stats.montantRembourse)}</p>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-stockpro-stock-error-bg to-stockpro-stock-error-bg dark:from-stockpro-stock-error-fg/12 dark:to-stockpro-stock-error-fg/8 rounded-bl-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-stockpro-stock-error-bg dark:bg-stockpro-stock-error-fg/12">
                <AlertTriangle className="w-4 h-4 text-stockpro-stock-error-fg" />
              </div>
              <span className="text-xs text-muted-foreground">En attente</span>
            </div>
            <p className="text-xl font-bold text-stockpro-stock-error-fg">{formatShortCurrency(stats.montantEnAttente)}</p>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </div>
        </Card>
      </div>

      {/* Filtres */}
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
            options={[
              { value: "retour", label: "Retour simple" },
              { value: "echange", label: "Échange" }
            ]}
          />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="h-9 px-3 text-sm bg-card border border-border rounded-lg text-foreground"
              placeholder="Date début"
            />
            <span className="text-muted-foreground">→</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="h-9 px-3 text-sm bg-card border border-border rounded-lg text-foreground"
              placeholder="Date fin"
            />
          </div>
          {(filterStatut || filterType || filterDateFrom || filterDateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatut("");
                setFilterType("");
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </Card>

      {/* Tableau */}
      <Card>
        <DataTable onToast={showToast}
          columns={columns}
          data={filteredRetours}
          title="Liste des retours et échanges"
          pageSize={5}
          searchable={true}
          searchPlaceholder="Rechercher par ID, client, produit..."
          exportOptions
        />
      </Card>

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