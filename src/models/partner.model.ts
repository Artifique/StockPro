export interface Client {
  id: number;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  type: 'VIP' | 'Grossiste' | 'Détaillant' | 'Particulier';
  solde: number;
  statut: 'actif' | 'inactif';
  newsletter_opt_in: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: number;
  nom: string;
  contact_person: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  category_id: number | null;
  statut: 'actif' | 'inactif';
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}
