/** Niveau de stock pour la charte OK / faible / rupture. */
export type StockLevel = "ok" | "low" | "out";

export function getStockLevel(stock: number, stockMin: number): StockLevel {
  if (stock === 0) return "out";
  if (stock <= stockMin) return "low";
  return "ok";
}

/** Classes Tailwind pour le texte d’une quantité stock (tableaux, KPI). */
export function getStockLevelTextClass(stock: number, stockMin: number): string {
  switch (getStockLevel(stock, stockMin)) {
    case "out":
      return "text-stockpro-stock-error-fg";
    case "low":
      return "text-stockpro-stock-low-fg";
    default:
      return "text-stockpro-stock-ok-fg";
  }
}
