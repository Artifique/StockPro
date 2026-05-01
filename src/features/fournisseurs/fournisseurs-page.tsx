"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Eye,
  Edit,
  Plus,
  Mail,
  User,
  Phone,
  Building,
  MapPin,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";
import { SupplierService } from "@/services/partner.service";
import { ProductService } from "@/services/product.service";
import { Supplier } from "@/models/partner.model";
import { Category } from "@/models/product.model";
import { InventoryService } from "@/services/inventory.service";
import { SupplierOrder } from "@/models/inventory.model";

export const FournisseursPage: React.FC<{
  onNavigate?: (route: string, filter?: string) => void;
}> = ({ onNavigate }) => {
  const newFournisseurModal = useDisclosure();
  const editFournisseurModal = useDisclosure();
  const detailsFournisseurModal = useDisclosure();
  
  const [fournisseurs, setFournisseurs] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [commandes, setCommandes] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Supplier | null>(null);
  
  const [editFournisseurData, setEditFournisseurData] = useState<Partial<Supplier>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [f, c, o] = await Promise.all([
        SupplierService.getAll(),
        ProductService.getCategories(),
        InventoryService.getAllSupplierOrders()
      ]);
      setFournisseurs(f);
      setCategories(c);
      setCommandes(o);
    } catch (error) {
      showToast("Erreur lors du chargement", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: "nom",
      label: "Fournisseur",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/12 flex items-center justify-center">
            <Building className="w-5 h-5 text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg" />
          </div>
          <div>
            <p className="font-medium text-foreground">{String(value)}</p>
            <p className="text-xs text-muted-foreground">{String(row.contact_person || "")}</p>
          </div>
        </div>
      ),
    },
    { key: "telephone", label: "Téléphone", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { 
      key: "category", 
      label: "Catégorie", 
      sortable: true,
      render: (value: unknown) => (value as Category)?.nom || "-"
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

  const handleCreateSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await SupplierService.create({
        nom: formData.get("nom") as string,
        contact_person: formData.get("contact") as string,
        telephone: formData.get("telephone") as string,
        email: formData.get("email") as string,
        category_id: parseInt(formData.get("category_id") as string),
        adresse: formData.get("adresse") as string,
        statut: 'actif',
        notes: null
      });
      showToast("Fournisseur créé avec succès !", "success");
      newFournisseurModal.close();
      loadData();
    } catch (error) {
      showToast("Erreur lors de la création", "error");
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFournisseur) return;
    try {
      await SupplierService.update(selectedFournisseur.id, editFournisseurData);
      showToast(`Fournisseur "${editFournisseurData.nom}" modifié avec succès`, "success");
      editFournisseurModal.close();
      loadData();
    } catch (error) {
      showToast("Erreur lors de la modification", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fournisseurs</h2>
          <p className="text-muted-foreground">Gérez vos partenaires fournisseurs</p>
        </div>
        <Button onClick={() => newFournisseurModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">{fournisseurs.length}</p>
          <p className="text-sm text-muted-foreground">Total fournisseurs</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">
            {fournisseurs.filter((f) => f.statut === "actif").length}
          </p>
          <p className="text-sm text-muted-foreground">Actifs</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-navy dark:text-stockpro-signal">
            {formatCurrency(commandes.reduce((sum, o) => sum + o.montant_total, 0))}
          </p>
          <p className="text-sm text-muted-foreground">CA Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-navy dark:text-stockpro-signal">
            {new Set(fournisseurs.map((f) => f.category_id)).size}
          </p>
          <p className="text-sm text-muted-foreground">Catégories</p>
        </Card>
      </div>

      {/* Table */}
      <DataTable onToast={showToast}
        columns={columns}
        data={fournisseurs as any[]}
        title="Liste des fournisseurs"
        pageSize={5}
        actions={(row) => {
          const fournisseur = fournisseurs.find((f) => f.nom === row.nom);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Voir les détails"
                onClick={() => {
                  setSelectedFournisseur(fournisseur || null);
                  detailsFournisseurModal.open();
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-navy dark:text-stockpro-signal hover:bg-stockpro-navy/8 dark:hover:bg-stockpro-signal/10"
                title="Modifier le fournisseur"
                onClick={() => {
                  if (fournisseur) {
                    setSelectedFournisseur(fournisseur);
                    setEditFournisseurData({
                      nom: fournisseur.nom,
                      contact_person: fournisseur.contact_person as any,
                      telephone: fournisseur.telephone,
                      email: fournisseur.email,
                      category_id: fournisseur.category_id as any, // Correction ici pour utiliser category_id
                      adresse: fournisseur.adresse,
                    });
                    editFournisseurModal.open();
                  }
                }}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-ok-fg hover:bg-stockpro-stock-ok-bg dark:hover:bg-stockpro-stock-ok-fg/10"
                title="Voir les commandes"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("achats", String(row.id));
                  } else {
                    showToast(`Commandes de ${row.nom}`, "info");
                  }
                }}
              >
                <ClipboardList className="w-4 h-4" />
              </button>
            </div>
          );
        }}
      />

      {/* Add Modal */}
      <Modal isOpen={newFournisseurModal.isOpen} onClose={newFournisseurModal.close} title="Nouveau fournisseur">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Fournisseur créé avec succès !", "success");
            newFournisseurModal.close();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom de l&apos;entreprise</label>
            <Input placeholder="Nom du fournisseur" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contact</label>
              <Input placeholder="Nom du contact" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
              <Input placeholder="+223 XX XX XX XX" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input type="email" placeholder="email@exemple.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
            <Select
              value=""
              onChange={() => { }}
              options={categories.map((c) => ({ value: c.nom, label: c.nom }))}
              placeholder="Sélectionner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Adresse</label>
            <textarea
              rows={2}
              placeholder="Adresse complète..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={newFournisseurModal.close}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Fournisseur Modal */}
      <Modal isOpen={editFournisseurModal.isOpen} onClose={editFournisseurModal.close} title="Modifier le fournisseur">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast(`Fournisseur "${editFournisseurData.nom}" modifié avec succès`, "success");
            editFournisseurModal.close();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom de l&apos;entreprise</label>
            <Input
              value={editFournisseurData.nom}
              onChange={(e) => setEditFournisseurData({ ...editFournisseurData, nom: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contact</label>
              <Input
                value={editFournisseurData.contact_person as any}
                onChange={(e) => setEditFournisseurData({ ...editFournisseurData, contact_person: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
              <Input
                value={editFournisseurData.telephone ?? ""}
                onChange={(e) => setEditFournisseurData({ ...editFournisseurData, telephone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              type="email"
              value={editFournisseurData.email ?? ""}              onChange={(e) => setEditFournisseurData({ ...editFournisseurData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
            <Select
              value={editFournisseurData.category_id as any}
              onChange={(v) => setEditFournisseurData({ ...editFournisseurData, category_id: parseInt(v as string) })}
              options={categories.map((c) => ({ value: c.nom, label: c.nom }))}
              placeholder="Sélectionner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Adresse</label>
            <textarea
              value={editFournisseurData.adresse ?? ""}
              onChange={(e) => setEditFournisseurData({ ...editFournisseurData, adresse: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={editFournisseurModal.close}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Fournisseur Details Modal */}
      <Modal isOpen={detailsFournisseurModal.isOpen} onClose={detailsFournisseurModal.close} title="Détails du fournisseur" size="lg">
        {selectedFournisseur && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-stockpro-stock-ok-bg dark:bg-stockpro-stock-ok-fg/12 flex items-center justify-center">
                <Building className="w-8 h-8 text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedFournisseur.nom}</h3>
                <p className="text-muted-foreground">{categories.find(c => c.id === selectedFournisseur.category_id)?.nom || "-"}</p>
                <Badge variant={selectedFournisseur.statut === "actif" ? "success" : "default"} className="mt-2">
                  {selectedFournisseur.statut === "actif" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Contact</p>
                </div>
                <p className="font-medium text-foreground">{selectedFournisseur.contact_person}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                </div>
                <p className="font-medium text-foreground">{selectedFournisseur.telephone}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
                <p className="font-medium text-foreground">{selectedFournisseur.email}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Adresse</p>
                </div>
                <p className="font-medium text-foreground">{selectedFournisseur.adresse}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-navy dark:text-stockpro-signal">
                  {formatCurrency(commandes.filter(c => c.supplier_id === selectedFournisseur.id).reduce((sum, c) => sum + c.montant_total, 0))}
                </p>
                <p className="text-xs text-muted-foreground">CA Total</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {commandes.filter((c) => c.supplier_id === selectedFournisseur.id).length}
                </p>
                <p className="text-xs text-muted-foreground">Commandes</p>
              </Card>
            </div>

            {/* Recent Orders */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Dernières commandes</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {commandes.filter((c) => c.supplier_id === selectedFournisseur.id).slice(0, 3).map((cmd) => (
                  <div key={cmd.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{cmd.id}</p>
                      <p className="text-xs text-muted-foreground">{cmd.created_at ? new Date(cmd.created_at).toLocaleDateString() : "-"} • {cmd.items?.length || 0} articles</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(cmd.montant_total)}</p>
                      <Badge variant={cmd.statut === "Reçue" ? "success" : cmd.statut === "En transit" ? "info" : "warning"}>{cmd.statut}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={detailsFournisseurModal.close}>
                Fermer
              </Button>
              <Button onClick={() => {
                detailsFournisseurModal.close();
                setEditFournisseurData({
                  nom: selectedFournisseur.nom,
                  contact_person: selectedFournisseur.contact_person,
                  telephone: selectedFournisseur.telephone,
                  email: selectedFournisseur.email,
                  category_id: selectedFournisseur.category_id,
                  adresse: selectedFournisseur.adresse,
                });
                editFournisseurModal.open();
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 PAGE ACHATS & COMMANDES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
