"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  Boxes,
  Download,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Button, Card } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { Select } from "@/components/stock-pro/primitives";
import { RapportsCharts } from "@/components/charts/rapports-charts";
import { SaleService } from "@/services/sale.service";
import { Transaction } from "@/models/sale.model";

export const RapportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ventes");
  const [periode, setPeriode] = useState("mois");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await SaleService.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      showToast("Erreur lors du chargement des rapports", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const monthlySummary = useMemo(() => {
    const summary: Record<string, { mois: string, ventes: number, achats: number }> = {};
    
    // Group by month
    transactions.forEach(t => {
      if (!t.created_at) return;
      const date = new Date(t.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!summary[key]) summary[key] = { mois: monthLabel, ventes: 0, achats: 0 };
      summary[key].ventes += t.total_ttc;
    });

    return Object.values(summary).sort((a, b) => b.mois.localeCompare(a.mois)).slice(0, 6);
  }, [transactions]);

  const tabs = [
    { id: "ventes", label: "Ventes", icon: TrendingUp },
    { id: "achats", label: "Achats", icon: ShoppingCart },
    { id: "stock", label: "Stock", icon: Boxes },
    { id: "clients", label: "Clients", icon: Users },
    { id: "financier", label: "Financier", icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Rapports & Analyses</h2>
          <p className="text-muted-foreground">Visualisez vos performances</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={periode}
            onChange={setPeriode}
            options={[
              { value: "jour", label: "Aujourd'hui" },
              { value: "semaine", label: "Cette semaine" },
              { value: "mois", label: "Ce mois" },
              { value: "trimestre", label: "Trimestre" },
              { value: "annee", label: "Année" },
            ]}
          />
          <Button variant="outline" onClick={() => showToast("Export en cours... Le fichier sera téléchargé.", "info")}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <RapportsCharts activeTab={activeTab} />

      {/* Summary Table */}
      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">Résumé mensuel</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mois</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Ventes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Achats</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Marge</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Évolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlySummary.map((row, i) => {
                const marge = row.ventes - row.achats;
                const prevMarge = i < monthlySummary.length - 1 ? monthlySummary[i + 1].ventes - monthlySummary[i + 1].achats : marge;
                const evolution = prevMarge > 0 ? ((marge - prevMarge) / prevMarge) * 100 : 0;

                return (
                  <tr key={row.mois} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{row.mois}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(row.ventes)}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(row.achats)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{formatCurrency(marge)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center text-sm ${evolution >= 0 ? "text-stockpro-stock-ok-fg" : "text-stockpro-stock-error-fg"}`}>
                        {evolution >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(evolution).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-stockpro-navy/8 dark:bg-stockpro-signal/12 font-semibold">
                <td className="px-4 py-3 text-sm text-stockpro-navy dark:text-stockpro-signal">Total</td>
                <td className="px-4 py-3 text-sm text-right text-stockpro-navy dark:text-stockpro-signal">
                  {formatCurrency(monthlySummary.reduce((sum, r) => sum + r.ventes, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-right text-stockpro-navy dark:text-stockpro-signal">
                  {formatCurrency(monthlySummary.reduce((sum, r) => sum + r.achats, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-right text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">
                  {formatCurrency(monthlySummary.reduce((sum, r) => sum + r.ventes - r.achats, 0))}
                </td>
                <td className="px-4 py-3 text-right">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
