"use client";

import { DataRow } from "@/types/data";

interface Props {
  headers: string[];
  rows: DataRow[];
  fileName: string;
}

export default function ExportPanel({ headers, rows, fileName }: Props) {
  function exportCSV() {
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => {
          const v = r[h] ?? "";
          const s = String(v);
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        }).join(",")
      ),
    ];
    downloadBlob(lines.join("\n"), "text/csv", baseName(fileName) + "_filtré.csv");
  }

  function exportJSON() {
    const json = JSON.stringify(rows, null, 2);
    downloadBlob(json, "application/json", baseName(fileName) + "_filtré.json");
  }

  function exportTSV() {
    const lines = [
      headers.join("\t"),
      ...rows.map((r) => headers.map((h) => String(r[h] ?? "")).join("\t")),
    ];
    downloadBlob(lines.join("\n"), "text/tab-separated-values", baseName(fileName) + "_filtré.tsv");
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Exporter {rows.length.toLocaleString("fr-FR")} lignes :
      </span>
      <button
        onClick={exportCSV}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors flex items-center gap-1.5"
      >
        📄 CSV
      </button>
      <button
        onClick={exportTSV}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors flex items-center gap-1.5"
      >
        📋 TSV
      </button>
      <button
        onClick={exportJSON}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors flex items-center gap-1.5"
      >
        {"{}"} JSON
      </button>
    </div>
  );
}

function baseName(f: string) {
  return f.replace(/\.[^.]+$/, "");
}

function downloadBlob(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
