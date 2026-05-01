import { supabase } from "@/lib/supabase/client";
import { SupplierOrder, SupplierOrderItem, Return } from "@/models/inventory.model";

export const InventoryService = {
  // Supplier Orders
  async getAllSupplierOrders(): Promise<SupplierOrder[]> {
    const { data, error } = await supabase
      .from('supplier_orders')
      .select('*, supplier:suppliers(nom)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createSupplierOrder(order: Omit<SupplierOrder, 'created_at' | 'supplier' | 'items'>, items: Omit<SupplierOrderItem, 'id' | 'order_id' | 'product'>[]): Promise<SupplierOrder> {
    const { data: ord, error: ordError } = await supabase.from('supplier_orders').insert(order).select().single();
    if (ordError) throw ordError;

    const itemsWithOrder = items.map(item => ({ ...item, order_id: ord.id }));
    const { error: itemsError } = await supabase.from('supplier_order_items').insert(itemsWithOrder);
    if (itemsError) throw itemsError;

    return ord;
  },

  // Returns
  async getAllReturns(): Promise<Return[]> {
    const { data, error } = await supabase
      .from('returns')
      .select('*, client:clients(nom), product:products(nom, sku)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createReturn(ret: Omit<Return, 'id' | 'created_at' | 'client' | 'product' | 'product_echange'>): Promise<Return> {
    const { data, error } = await supabase.from('returns').insert(ret).select().single();
    if (error) throw error;
    return data;
  },

  async updateReturnStatut(id: string, statut: Return['statut'], processedBy: string): Promise<void> {
    const { error } = await supabase.from('returns').update({ statut, processed_by: processedBy, date_validation: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
};
