"use client";

import React, { useState, useEffect } from "react";
import { SystemService } from "@/services/system.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AdminSettingsPage: React.FC = () => {
  const [applicationName, setApplicationName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationName = async () => {
      setLoading(true);
      setError(null);
      try {
        const name = await SystemService.getSetting("application_name");
        setApplicationName(name || "");
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching application name:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationName();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await SystemService.saveSetting("application_name", applicationName);
      console.log("Application name saved:", applicationName);
    } catch (err: any) {
      setError(err.message);
      console.error("Error saving application name:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des paramètres d'administration...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Paramètres d'Administration</h2>
      <div className="mb-4">
        <label htmlFor="application_name" className="block text-sm font-medium text-gray-700">
          Nom de l'Application
        </label>
        <Input
          id="application_name"
          type="text"
          value={applicationName}
          onChange={(e) => setApplicationName(e.target.value)}
          className="mt-1 block w-full"
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
      </Button>
    </div>
  );
};
