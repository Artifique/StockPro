"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  FileText,
  X,
  Search,
  Eye,
  Trash2,
  Plus,
  Download,
  Filter,
  Send,
  Check,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { loadJsPdf } from "@/lib/pdf";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";
import { SaleService } from "@/services/sale.service";
import { ClientService } from "@/services/partner.service";
import { ProductService } from "@/services/product.service";
import { Invoice } from "@/models/sale.model";
import { Client } from "@/models/partner.model";
import { Product } from "@/models/product.model";

async function generateInvoicePDF(facture: Invoice) {
  const jsPDF = await loadJsPdf();
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(16);
  doc.text(`Facture ${facture.id}`, 20, y);
  y += 12;
  doc.setFontSize(11);
  doc.text(`Client: ${facture.client?.nom || "Client inconnu"}`, 20, y);
  y += 8;
  doc.text(`Date: ${facture.created_at ? new Date(facture.created_at).toLocaleDateString() : "-"}`, 20, y);
  y += 8;
  doc.text(`Echeance: ${facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString() : "-"}`, 20, y);
  y += 8;
  doc.text(`Statut: ${facture.statut}`, 20, y);
  y += 12;
  doc.text(`Montant TTC: ${formatCurrency(facture.montant_total)}`, 20, y);
  doc.save(`${facture.id}.pdf`);
}

export const FacturationPage: React.FC = () => {
  const [filterStatut, setFilterStatut] = useState("");
  const newFactureModal = useDisclosure();
  const factureDetailsModal = useDisclosure();
  const productSelectModal = useDisclosure();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFacture, setSelectedFacture] = useState<Invoice | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchProduct, setSearchProduct] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inv, c, p] = await Promise.all([
        SaleService.getAllInvoices(),
        ClientService.getAll(),
        ProductService.getAll()
      ]);
      setInvoices(inv);
      setClients(c);
      setProducts(p);
    } catch (error) {
      showToast("Erreur lors du chargement", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const closeNewFactureModal = () => {
    newFactureModal.close();
    setInvoiceLines([]);
  };

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, f) => sum + f.montant_total, 0);
    const payees = invoices.filter((f) => f.statut === "Payée").reduce((sum, f) => sum + f.montant_total, 0);
    const enAttente = invoices.filter((f) => f.statut === "En attente").reduce((sum, f) => sum + f.montant_total, 0);
    const enRetard = invoices.filter((f) => f.statut === "En retard").reduce((sum, f) => sum + f.montant_total, 0);
    return { total, payees, enAttente, enRetard };
  }, [invoices]);

  const filteredFactures = useMemo(() => {
    if (!filterStatut) return invoices;
    return invoices.filter((f) => f.statut === filterStatut);
  }, [invoices, filterStatut]);

  const columns = [
    { key: "id", label: "N° Facture", sortable: true },
    { 
      key: "client", 
      label: "Client", 
      sortable: true,
      render: (value: unknown) => (value as Client)?.nom || "-"
    },
    { 
      key: "created_at", 
      label: "Date", 
      sortable: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString() : "-"
    },
    { 
      key: "date_echeance", 
      label: "Échéance", 
      sortable: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString() : "-"
    },
    {
      key: "montant_total",
      label: "Montant",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (value: unknown) => {
        const statusStyles: Record<string, { variant: "success" | "warning" | "danger" | "default" }> = {
          Payée: { variant: "success" },
          "En attente": { variant: "warning" },
          "En retard": { variant: "danger" },
          Annulée: { variant: "default" },
        };
        const style = statusStyles[String(value)] || { variant: "default" as const };
        return <Badge variant={style.variant}>{String(value)}</Badge>;
      },
    },
  ];

  const handleUpdateStatut = async (id: string, statut: Invoice['statut']) => {
    try {
      await SaleService.updateInvoiceStatut(id, statut);
      showToast("Statut mis à jour", "success");
      loadData();
    } catch (error) {
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Facturation</h2>
          <p className="text-muted-foreground">Gérez vos factures et encaissements</p>
        </div>
        <Button onClick={() => newFactureModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.total)}</p>
          <p className="text-sm text-muted-foreground">Total facturé</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-ok-fg">{formatCurrency(stats.payees)}</p>
          <p className="text-sm text-muted-foreground">Payées</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-low-fg">{formatCurrency(stats.enAttente)}</p>
          <p className="text-sm text-muted-foreground">En attente</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-error-fg">{formatCurrency(stats.enRetard)}</p>
          <p className="text-sm text-muted-foreground">En retard</p>
        </Card>
      </div>

      <Card padding="sm">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select
            value={filterStatut}
            onChange={setFilterStatut}
            placeholder="Tous les statuts"
            options={[
              { value: "Payée", label: "Payée" },
              { value: "En attente", label: "En attente" },
              { value: "En retard", label: "En retard" },
              { value: "Annulée", label: "Annulée" },
            ]}
          />
        </div>
      </Card>

      <DataTable onToast={showToast}
        columns={columns}
        data={filteredFactures}
        title="Liste des factures"
        pageSize={5}
        isLoading={isLoading}
        exportOptions
        actions={(row) => {
          const facture = invoices.find((f) => f.id === row.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Voir les détails"
                onClick={() => {
                  setSelectedFacture(facture || null);
                  factureDetailsModal.open();
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-navy dark:text-stockpro-signal hover:bg-stockpro-navy/8"
                title="Télécharger PDF"
                onClick={() => facture && generateInvoicePDF(facture)}
              >
                <Download className="w-4 h-4" />
              </button>
              {(row.statut === "En attente" || row.statut === "En retard") && (
                <button
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-ok-fg"
                  title="Marquer comme payée"
                  onClick={() => handleUpdateStatut(row.id as string, "Payée")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        }}
      />

      <Modal isOpen={newFactureModal.isOpen} onClose={closeNewFactureModal} title="Nouvelle facture" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); showToast("Fonctionnalité en cours...", "info"); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Client</label>
              <Select
                value=""
                onChange={() => { }}
                options={clients.map((c) => ({ value: String(c.id), label: c.nom }))}
                placeholder="Sélectionner un client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date de facture</label>
              <Input type="date" required />
            </div>
          </div>

          <div className="border border-dashed border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Lignes de facturation</h4>
              <Button variant="outline" size="sm" type="button" onClick={() => productSelectModal.open()}>
                <Plus className="w-4 h-4 mr-1" /> Ajouter un produit
              </Button>
            </div>
            {invoiceLines.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Aucun produit ajouté</div>
            ) : (
              <div className="space-y-2">
                {invoiceLines.map((line, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{line.product.nom}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(line.product.prix_vente)} x {line.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-sm">{formatCurrency(line.product.prix_vente * line.quantity)}</p>
                      <button type="button" onClick={() => setInvoiceLines(invoiceLines.filter((_, i) => i !== index))} className="text-stockpro-stock-error-fg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-medium">Total TTC</span>
                  <span className="text-xl font-bold text-stockpro-navy dark:text-stockpro-signal">
                    {formatCurrency(invoiceLines.reduce((sum, l) => sum + l.product.prix_vente * l.quantity, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {productSelectModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h4 className="font-semibold">Sélectionner un produit</h4>
                  <button type="button" onClick={() => productSelectModal.close()}><X className="w-5 h-5" /></button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setInvoiceLines([...invoiceLines, { product, quantity: 1 }]);
                        productSelectModal.close();
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left border-b border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.nom}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(product.prix_vente)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={closeNewFactureModal}>Annuler</Button>
            <Button type="submit">Créer la facture</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={factureDetailsModal.isOpen} onClose={factureDetailsModal.close} title="Détails de la facture" size="lg">
        {selectedFacture && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{selectedFacture.id}</h3>
                <p className="text-muted-foreground">{selectedFacture.client?.nom || "Inconnu"}</p>
              </div>
              <Badge variant={selectedFacture.statut === "Payée" ? "success" : "warning"}>{selectedFacture.statut}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(selectedFacture.montant_total)}</p>
                <p className="text-xs text-muted-foreground">Total TTC</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold">{selectedFacture.created_at ? new Date(selectedFacture.created_at).toLocaleDateString() : "-"}</p>
                <p className="text-xs text-muted-foreground">Date</p>
              </Card>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={factureDetailsModal.close}>Fermer</Button>
              <Button variant="outline" onClick={() => generateInvoicePDF(selectedFacture)}><Download className="w-4 h-4 mr-2" /> PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
  };