export function formatCurrency(value: number): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " FCFA"
  );
}

export function formatShortCurrency(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + "K";
  }
  return value.toString();
}
