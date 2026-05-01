import { supabase } from "@/lib/supabase/client";
import { ActivityLog, Setting, Profile, Notification } from "@/models/system.model";

export const SystemService = {
  // Logs
  async getLogs(limit = 100): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profile:profiles(nom, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async addLog(log: Omit<ActivityLog, 'id' | 'created_at' | 'profile'>): Promise<void> {
    const { error } = await supabase.from('activity_logs').insert(log);
    if (error) throw error;
  },

  // Settings
  async getSetting(key: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    return data?.value || null;
  },

  async saveSetting(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  // Profiles
  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, profile: Partial<Profile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id);
    if (error) throw error;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data || [];
  }
};

export const NotificationService = {
  async getAll(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ ...notification, is_read: false })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsRead(id: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
