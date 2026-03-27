"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";
import { DataSet } from "@/types/data";

interface Props {
  onDataLoaded: (data: DataSet) => void;
}

export default function DataUpload({ onDataLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function processFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        if (result.errors.length > 0 && result.data.length === 0) {
          setError("Erreur lors du parsing CSV : " + result.errors[0].message);
          return;
        }
        const headers = result.meta.fields ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = result.data as any[];
        onDataLoaded({ headers, rows, fileName: file.name });
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const sheetRows = await readXlsxFile(file);
        if (sheetRows.length < 2) {
          setError("Le fichier Excel semble vide.");
          return;
        }
        const headers = sheetRows[0].map(String);
        const rows = sheetRows.slice(1).map((row) => {
          const obj: Record<string, string | number | null> = {};
          headers.forEach((h, i) => {
            const v = row[i];
            obj[h] = v === null ? null : typeof v === "number" ? v : String(v);
          });
          return obj;
        });
        onDataLoaded({ headers, rows, fileName: file.name });
      } else {
        setError("Format non supporté. Utilisez CSV, TSV ou XLSX.");
      }
    } catch (e) {
      setError("Erreur inattendue : " + String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors
          ${dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {loading ? "Chargement..." : "Glisser-déposer votre fichier ici"}
        </p>
        <p className="text-sm text-gray-500">ou cliquer pour sélectionner</p>
        <p className="text-xs text-gray-400">CSV, TSV, XLSX · Max 50 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && (
        <div className="w-full max-w-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Pas de données ? Essayez un{" "}
        <button
          className="underline text-blue-500 hover:text-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            loadSampleData(onDataLoaded);
          }}
        >
          jeu de données exemple
        </button>
      </div>
    </div>
  );
}

function loadSampleData(onDataLoaded: (data: DataSet) => void) {
  const headers = ["Région", "Produit", "Ventes", "Coût", "Profit", "Quantité", "Mois"];
  const regions = ["Nord", "Sud", "Est", "Ouest", "Centre"];
  const products = ["Produit A", "Produit B", "Produit C", "Produit D"];
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Août", "Sep", "Oct", "Nov", "Déc"];
  const rows = Array.from({ length: 200 }, () => {
    const ventes = Math.round(Math.random() * 50000 + 5000);
    const cout = Math.round(ventes * (0.4 + Math.random() * 0.3));
    return {
      Région: regions[Math.floor(Math.random() * regions.length)],
      Produit: products[Math.floor(Math.random() * products.length)],
      Ventes: ventes,
      Coût: cout,
      Profit: ventes - cout,
      Quantité: Math.round(Math.random() * 500 + 10),
      Mois: months[Math.floor(Math.random() * months.length)],
    };
  });
  onDataLoaded({ headers, rows, fileName: "exemple.csv" });
}
