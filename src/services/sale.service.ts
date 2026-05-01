import { supabase } from "@/lib/supabase/client";
import { Transaction, TransactionItem, Invoice } from "@/models/sale.model";

export const SaleService = {
  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getTransactionDetails(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, client:clients(*), items:transaction_items(*, product:products(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'created_at' | 'client' | 'items'>, items: Omit<TransactionItem, 'id' | 'transaction_id' | 'product'>[]): Promise<Transaction> {
    // We use a transaction-like approach or Promise.all if Supabase transaction isn't easy via client
    // Best way in Supabase client for simple atomicity is using RPC or just sequential calls if needed
    // Here we'll do sequential for clarity, but in prod a stored procedure (RPC) is safer.
    
    const { data: trx, error: trxError } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (trxError) throw trxError;

    const itemsWithTrx = items.map(item => ({ ...item, transaction_id: trx.id }));
    const { error: itemsError } = await supabase.from('transaction_items').insert(itemsWithTrx);
    
    if (itemsError) throw itemsError;

    return trx;
  },

  // Invoices
  async getAllInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateInvoiceStatut(id: string, statut: Invoice['statut']): Promise<void> {
    const { error } = await supabase.from('invoices').update({ statut }).eq('id', id);
    if (error) throw error;
  }
};
