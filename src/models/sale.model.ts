import { Product } from "./product.model";
import { Client } from "./partner.model";

export interface Transaction {
  id: string; // TRX-XXX
  client_id: number | null;
  total_ht: number;
  total_tva: number;
  discount_rate: number;
  discount_amount: number;
  total_ttc: number;
  mode_paiement: 'Espèces' | 'Carte' | 'Mobile Money' | 'Chèque' | 'Virement' | 'Crédit';
  statut: 'Payé' | 'En attente' | 'Annulé';
  user_id: string | null;
  created_at?: string;
  // Join fields
  client?: Client;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: string;
  product_id: number | null;
  quantite: number;
  prix_unitaire: number;
  tva_rate: number;
  total_ligne: number;
  // Join fields
  product?: Product;
}

export interface Invoice {
  id: string; // FAC-YYYY-XXX
  client_id: number | null;
  transaction_id: string | null;
  montant_total: number;
  statut: 'Payée' | 'En attente' | 'En retard' | 'Annulée';
  date_echeance: string | null;
  created_at?: string;
  // Join fields
  client?: Client;
  transaction?: Transaction;
}
