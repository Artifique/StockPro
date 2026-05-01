export interface Category {
  id: number;
  nom: string;
  color: string;
  created_at?: string;
}

export interface Unit {
  id: number;
  nom: string;
  abreviation: string;
  created_at?: string;
}

export interface Product {
  id: number;
  nom: string;
  sku: string;
  category_id: number | null;
  prix_achat: number;
  prix_vente: number;
  stock: number;
  stock_min: number;
  unit_id: number | null;
  description: string | null;
  tva: number;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
  // Join fields
  category?: Category;
  unit?: Unit;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: 'Entrée' | 'Sortie' | 'Ajustement';
  quantite: number;
  user_id: string | null;
  motif: string | null;
  created_at?: string;
  // Join fields
  product?: Product;
}
