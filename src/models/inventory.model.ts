import { Product } from "./product.model";
import { Supplier } from "./partner.model";
import { Client } from "./partner.model";

export interface SupplierOrder {
  id: string; // CMD-XXX
  supplier_id: number;
  montant_total: number;
  statut: 'Reçue' | 'En transit' | 'En attente' | 'Annulée';
  expected_delivery_date: string | null;
  notes: string | null;
  created_at?: string;
  // Join fields
  supplier?: Supplier;
  items?: SupplierOrderItem[];
}

export interface SupplierOrderItem {
  id: number;
  order_id: string;
  product_id: number | null;
  quantite: number;
  prix_unitaire_achat: number;
  total_ligne: number;
  // Join fields
  product?: Product;
}

export interface Return {
  id: string; // RET-YYYY-XXX
  client_id: number | null;
  product_id: number | null;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  type: 'retour' | 'echange';
  motif_id: string | null;
  motif_description: string | null;
  statut: 'demande' | 'en_attente' | 'valide' | 'rembourse' | 'echange' | 'refuse' | 'annule';
  date_validation: string | null;
  product_echange_id: number | null;
  montant_rembourse: number;
  processed_by: string | null; // UUID from profiles
  notes: string | null;
  created_at?: string;
  // Join fields
  client?: Client;
  product?: Product;
  product_echange?: Product;
}
