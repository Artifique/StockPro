"use client";

import React, { useState } from "react";
import { Package, Boxes, ShoppingCart, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { StockProUser } from "@/data/stock-mock";

export const OnboardingModal: React.FC<{
  user: StockProUser;
  onClose: () => void;
}> = ({ user: _user, onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue sur StockPro Manager ! 👋",
      description: "Découvrez comment gérer efficacement votre stock et vos ventes.",
      icon: <Package className="w-16 h-16 text-indigo-500" />,
    },
    {
      title: "Gérez vos produits",
      description: "Ajoutez, modifiez et suivez vos produits en temps réel. Recevez des alertes automatiques pour les ruptures de stock.",
      icon: <Boxes className="w-16 h-16 text-amber-500" />,
    },
    {
      title: "Vendez facilement",
      description: "Utilisez le Point de Vente (POS) pour enregistrer vos ventes rapidement avec différentes méthodes de paiement.",
      icon: <ShoppingCart className="w-16 h-16 text-emerald-500" />,
    },
    {
      title: "Analysez vos performances",
      description: "Consultez vos tableaux de bord et rapports pour prendre les meilleures décisions commerciales.",
      icon: <BarChart3 className="w-16 h-16 text-sky-500" />,
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">{steps[step].icon}</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{steps[step].title}</h2>
          <p className="text-slate-600 dark:text-slate-400">{steps[step].description}</p>
        </div>

        <div className="flex items-center justify-between px-8 py-6 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Retour
              </Button>
            )}
            {isLast ? (
              <Button onClick={onClose}>Commencer</Button>
            ) : (
              <Button onClick={() => setStep(step + 1)}>Suivant</Button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
