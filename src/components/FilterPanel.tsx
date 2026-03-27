"use client";

import { useState } from "react";
import { FilterConfig } from "@/types/data";

const OPERATORS = [
  { id: "eq", label: "=" },
  { id: "ne", label: "≠" },
  { id: "gt", label: ">" },
  { id: "gte", label: "≥" },
  { id: "lt", label: "<" },
  { id: "lte", label: "≤" },
  { id: "contains", label: "contient" },
  { id: "not_contains", label: "ne contient pas" },
] as const;

interface Props {
  headers: string[];
  filters: FilterConfig[];
  onChange: (filters: FilterConfig[]) => void;
}

export default function FilterPanel({ headers, filters, onChange }: Props) {
  const [col, setCol] = useState(headers[0] ?? "");
  const [op, setOp] = useState<FilterConfig["operator"]>("eq");
  const [val, setVal] = useState("");

  function addFilter() {
    if (!col || val.trim() === "") return;
    onChange([...filters, { column: col, operator: op, value: val.trim() }]);
    setVal("");
  }

  function removeFilter(i: number) {
    onChange(filters.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Colonne</label>
          <select
            value={col}
            onChange={(e) => setCol(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
          >
            {headers.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Opérateur</label>
          <select
            value={op}
            onChange={(e) => setOp(e.target.value as FilterConfig["operator"])}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
          >
            {OPERATORS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Valeur</label>
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFilter()}
            placeholder="valeur…"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 w-40"
          />
        </div>
        <button
          onClick={addFilter}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
        >
          + Ajouter
        </button>
        {filters.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f, i) => {
            const opLabel = OPERATORS.find((o) => o.id === f.operator)?.label ?? f.operator;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full px-3 py-1 text-xs font-medium"
              >
                <span className="font-semibold">{f.column}</span>
                <span className="text-blue-400">{opLabel}</span>
                <span>&quot;{f.value}&quot;</span>
                <button
                  onClick={() => removeFilter(i)}
                  className="ml-1 text-blue-400 hover:text-blue-600 font-bold text-sm leading-none"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
