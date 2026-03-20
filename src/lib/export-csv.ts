/** Télécharge un fichier CSV avec BOM UTF-8 (Excel / tableurs). */
export function downloadCsvFile(filename: string, csvBody: string): void {
  const blob = new Blob(["\ufeff" + csvBody], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
