"use client";

import React, { useState } from "react";
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
import { VENTES_MENSUELLES } from "@/data/stock-mock";
import { formatCurrency } from "@/lib/format";
import { Button, Card } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { Select } from "@/components/stock-pro/primitives";
import { RapportsCharts } from "@/components/charts/rapports-charts";

export const RapportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ventes");
  const [periode, setPeriode] = useState("mois");

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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Rapports & Analyses</h2>
          <p className="text-slate-500 dark:text-slate-400">Visualisez vos performances</p>
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
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
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
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Résumé mensuel</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Mois</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Ventes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Achats</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Marge</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Évolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {VENTES_MENSUELLES.slice(-6).map((row, i) => {
                const marge = row.ventes - row.achats;
                const prevMarge = i > 0 ? VENTES_MENSUELLES[VENTES_MENSUELLES.length - 6 + i - 1].ventes - VENTES_MENSUELLES[VENTES_MENSUELLES.length - 6 + i - 1].achats : marge;
                const evolution = prevMarge > 0 ? ((marge - prevMarge) / prevMarge) * 100 : 0;

                return (
                  <tr key={row.mois} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{row.mois}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.ventes)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.achats)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(marge)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center text-sm ${evolution >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {evolution >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(evolution).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 dark:bg-indigo-900/30 font-semibold">
                <td className="px-4 py-3 text-sm text-indigo-800 dark:text-indigo-300">Total</td>
                <td className="px-4 py-3 text-sm text-right text-indigo-800 dark:text-indigo-300">
                  {formatCurrency(VENTES_MENSUELLES.reduce((sum, r) => sum + r.ventes, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-right text-indigo-800 dark:text-indigo-300">
                  {formatCurrency(VENTES_MENSUELLES.reduce((sum, r) => sum + r.achats, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(VENTES_MENSUELLES.reduce((sum, r) => sum + r.ventes - r.achats, 0))}
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
