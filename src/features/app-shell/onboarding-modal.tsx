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
      icon: <Package className="w-16 h-16 text-stockpro-navy dark:text-stockpro-signal" />,
    },
    {
      title: "Gérez vos produits",
      description: "Ajoutez, modifiez et suivez vos produits en temps réel. Recevez des alertes automatiques pour les ruptures de stock.",
      icon: <Boxes className="h-16 w-16 text-stockpro-stock-low-fg" />,
    },
    {
      title: "Vendez facilement",
      description: "Utilisez le Point de Vente (POS) pour enregistrer vos ventes rapidement avec différentes méthodes de paiement.",
      icon: <ShoppingCart className="w-16 h-16 text-stockpro-stock-ok-fg" />,
    },
    {
      title: "Analysez vos performances",
      description: "Consultez vos tableaux de bord et rapports pour prendre les meilleures décisions commerciales.",
      icon: <BarChart3 className="h-16 w-16 text-stockpro-navy dark:text-stockpro-signal" />,
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-stockpro-navy/80 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">{steps[step].icon}</div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{steps[step].title}</h2>
          <p className="text-muted-foreground">{steps[step].description}</p>
        </div>

        <div className="flex items-center justify-between px-8 py-6 bg-muted/50">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i === step ? "bg-stockpro-signal" : "bg-muted-foreground/30 dark:bg-muted-foreground/40"
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
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground dark:hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
