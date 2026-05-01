import { supabase } from "@/lib/supabase/client";
import { Client, Supplier } from "@/models/partner.model";

export const ClientService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Client | null> {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const { data, error } = await supabase.from('clients').insert(client).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: number, client: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase.from('clients').update(client).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
};

export const SupplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase.from('suppliers').select('*, category:categories(*)');
    if (error) throw error;
    return data || [];
  },

  async create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').update(supplier).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
