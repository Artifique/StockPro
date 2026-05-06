"use client";

import React, { useState, useEffect } from "react";
import { Profile } from "@/models/system.model";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserSetting {
  user_id: string;
  key: string;
  value: string;
}

export const ParametresUtilisateurPage: React.FC<{ currentUser: Profile }> = ({
  currentUser,
}) => {
  const [themePreference, setThemePreference] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("key", "theme_preference")
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        setError(error.message);
        console.error("Error fetching settings:", error);
      } else if (data) {
        setThemePreference(data.value);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [currentUser.id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("settings")
      .upsert(
        { user_id: currentUser.id, key: "theme_preference", value: themePreference },
        { onConflict: "user_id,key" }
      );

    if (error) {
      setError(error.message);
      console.error("Error saving settings:", error);
    } else {
      console.log("Settings saved:", data);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-6">Chargement des paramètres...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Paramètres pour {currentUser.nom}</h2>
      <div className="mb-4">
        <label htmlFor="theme_preference" className="block text-sm font-medium text-gray-700">
          Préférence de thème
        </label>
        <Input
          id="theme_preference"
          type="text"
          value={themePreference}
          onChange={(e) => setThemePreference(e.target.value)}
          className="mt-1 block w-full"
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
      </Button>
    </div>
  );
};

