"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Package,
  Printer,
  Search,
} from "lucide-react";
import { downloadCsvFile } from "@/lib/export-csv";
import { loadJsPdfWithAutoTable } from "@/lib/pdf";
import { Button } from "./button";
import { Card } from "./card";

type ToastType = "success" | "error" | "warning" | "info";

type DataTableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
};

type DataTableProps = {
  columns: DataTableColumn[];
  data: Record<string, unknown>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  actions?: (row: Record<string, unknown>) => React.ReactNode;
  exportOptions?: boolean;
  emptyMessage?: string;
  title?: string;
  onToast: (message: string, type: ToastType) => void;
};

export function DataTable(props: DataTableProps) {
  const {
    columns,
    data,
    searchable = true,
    searchPlaceholder = "Rechercher...",
    pagination = true,
    pageSize = 10,
    selectable = false,
    actions,
    exportOptions = true,
    emptyMessage = "Aucune donnée disponible",
    title = "Export",
    onToast,
  } = props;

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      const comparison = aVal! > bVal! ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => i)));
    }
  };

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = sortedData
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col.key];
            const stringValue = String(value ?? "");
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return '"' + stringValue.replace(/"/g, '""') + '"';
            }
            return stringValue;
          })
          .join(",")
      )
      .join("\n");

    const csv = headers + "\n" + rows;
    const fileName = title.toLowerCase().replace(/\s+/g, "_");
    downloadCsvFile(fileName + "_" + new Date().toISOString().split("T")[0] + ".csv", csv);
    onToast('Export CSV "' + title + '" téléchargé avec succès', "success");
  };

  const exportToPDF = async () => {
    onToast("Génération du PDF en cours...", "info");

    try {
      const { jsPDF, autoTable } = await loadJsPdfWithAutoTable();

      const doc = new jsPDF("l", "mm", "a4");

      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(title, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Exporté le " +
          new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
        14,
        28
      );

      const tableHeaders = columns.map((col) => col.label);
      const tableRows = sortedData.map((row) =>
        columns.map((col) => {
          const value = row[col.key];
          return String(value ?? "-");
        })
      );

      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 35,
        theme: "striped",
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250],
        },
        margin: { top: 35, left: 14, right: 14 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            "Page " + data.pageNumber + " sur " + pageCount + " - StockPro Manager",
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        },
      });

      const fn = title.toLowerCase().replace(/\s+/g, "_");
      doc.save(fn + "_" + new Date().toISOString().split("T")[0] + ".pdf");

      onToast('PDF "' + title + '" téléchargé avec succès', "success");
    } catch {
      onToast("Erreur lors de la génération du PDF", "error");
    }
  };

  return (
    <Card padding="none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border">
        {searchable && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>
        )}
        {exportOptions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Printer className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-stockpro-navy focus:ring-stockpro-signal"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={
                    "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider " +
                    (col.sortable ? "cursor-pointer hover:bg-muted" : "")
                  }
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortKey === col.key && (sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">{emptyMessage}</p>
                    {search && (
                      <p className="text-sm text-muted-foreground mt-1">Essayez de modifier vos critères de recherche</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/50 transition-colors">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => toggleRow(rowIndex)}
                        className="w-4 h-4 rounded border-border text-stockpro-navy focus:ring-stockpro-signal"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-foreground">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Afficher</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded border border-border bg-card text-foreground"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>lignes sur {sortedData.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
