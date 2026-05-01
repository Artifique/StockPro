"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const VENTES_MENSUELLES = [
  { mois: "Jan", ventes: 0 },
  { mois: "Fév", ventes: 0 },
  { mois: "Mar", ventes: 0 },
];
const REPARTITION_CA = [
  { name: "Ventes", valeur: 0, color: "#1a2b6d" },
];
const TOP_PRODUITS = [
  { nom: "N/A", ca: 0 },
];
import { formatCurrency, formatShortCurrency } from "@/lib/format";
import { Card } from "@/components/ui";

export function RapportsCharts({ activeTab }: { activeTab: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {activeTab === "ventes" && "Évolution des ventes"}
          {activeTab === "achats" && "Évolution des achats"}
          {activeTab === "stock" && "Évolution du stock"}
          {activeTab === "clients" && "Acquisition clients"}
          {activeTab === "financier" && "Performance financière"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={VENTES_MENSUELLES}>
              <defs>
                <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a2b6d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1a2b6d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mois" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={formatShortCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="ventes" stroke="#1a2b6d" fill="url(#reportGradient)" />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">Répartition</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie data={REPARTITION_CA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="valeur">
                {REPARTITION_CA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">Comparaison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={TOP_PRODUITS.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={formatShortCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="ca" fill="#1a2b6d" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
