import { supabase } from "@/lib/supabase/client";
import { Product, Category, Unit, StockMovement } from "@/models/product.model";

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), unit:units(*)');
    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), unit:units(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'unit'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  },

  // Units
  async getUnits(): Promise<Unit[]> {
    const { data, error } = await supabase.from('units').select('*');
    if (error) throw error;
    return data || [];
  },

  // Stock Movements
  async getMovements(productId?: number): Promise<StockMovement[]> {
    let query = supabase.from('stock_movements').select('*, product:products(nom, sku)');
    if (productId) query = query.eq('product_id', productId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
