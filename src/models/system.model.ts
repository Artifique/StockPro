export interface Profile {
  id: string; // UUID from auth.users
  email: string;
  role: string;
  nom: string;
  avatar: string | null;
  color: string;
  statut: 'actif' | 'inactif';
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  is_read: boolean;
  metadata: Record<string, any> | null;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  type: string;
  category: string;
  user_id: string | null;
  details: string | null;
  ip_address: string | null;
  metadata: Record<string, any> | null;
  severity: 'info' | 'success' | 'warning' | 'danger';
  created_at?: string;
  // Join fields
  profile?: Profile;
}

export interface Setting {
  key: string;
  value: any;
  updated_at?: string;
}
