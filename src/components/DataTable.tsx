"use client";

import { useMemo, useState } from "react";
import { DataRow } from "@/types/data";

interface Props {
  headers: string[];
  rows: DataRow[];
}

const PAGE_SIZES = [10, 25, 50, 100];

export default function DataTable({ headers, rows }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      headers.some((h) => String(r[h] ?? "").toLowerCase().includes(q))
    );
  }, [rows, headers, search]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      const an = Number(av);
      const bn = Number(bv);
      const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Rechercher dans les données…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{sorted.length.toLocaleString("fr-FR")} lignes</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-gray-400 w-10">#</th>
              {headers.map((h) => (
                <th
                  key={h}
                  onClick={() => handleSort(h)}
                  className="px-3 py-2 text-left font-semibold cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap group"
                >
                  <span className="flex items-center gap-1">
                    {h}
                    <span className="text-gray-400 text-xs">
                      {sortCol === h ? (sortDir === "asc" ? "▲" : "▼") : <span className="opacity-0 group-hover:opacity-40">▲</span>}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="text-center py-8 text-gray-400">
                  Aucun résultat
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-3 py-1.5 text-gray-400 text-xs">
                    {(currentPage - 1) * pageSize + i + 1}
                  </td>
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate">
                      {row[h] === null || row[h] === "" ? (
                        <span className="text-gray-300 dark:text-gray-600 italic text-xs">null</span>
                      ) : (
                        String(row[h])
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Page {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
            return start + i;
          }).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2.5 py-1 rounded border ${p === currentPage
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
