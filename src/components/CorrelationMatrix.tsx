"use client";

import { useMemo } from "react";
import { DataRow, ColumnStats } from "@/types/data";
import { computeCorrelation } from "@/lib/dataUtils";

interface Props {
  rows: DataRow[];
  stats: ColumnStats[];
}

function colorFromCorr(r: number): string {
  // negative: red, zero: white, positive: blue
  if (r > 0) {
    const intensity = Math.round(r * 200);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  } else {
    const intensity = Math.round(-r * 200);
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  }
}

function textColor(r: number): string {
  return Math.abs(r) > 0.5 ? "white" : "inherit";
}

export default function CorrelationMatrix({ rows, stats }: Props) {
  const numericCols = useMemo(
    () => stats.filter((s) => s.type === "numeric").map((s) => s.column),
    [stats]
  );

  const matrix = useMemo(() => {
    return numericCols.map((a) =>
      numericCols.map((b) => (a === b ? 1 : computeCorrelation(rows, a, b)))
    );
  }, [rows, numericCols]);

  if (numericCols.length < 2) {
    return (
      <div className="text-gray-400 text-center py-12">
        Nécessite au moins 2 colonnes numériques.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Coefficient de corrélation de Pearson entre les colonnes numériques.
        Bleu = corrélation positive, Rouge = corrélation négative.
      </p>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2" />
              {numericCols.map((c) => (
                <th
                  key={c}
                  className="p-1 text-xs font-medium text-gray-500 whitespace-nowrap"
                  style={{ maxWidth: 80, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 100, verticalAlign: "bottom" }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericCols.map((rowCol, ri) => (
              <tr key={rowCol}>
                <td className="pr-2 text-xs font-medium text-gray-500 whitespace-nowrap text-right">{rowCol}</td>
                {numericCols.map((_, ci) => {
                  const r = matrix[ri][ci];
                  return (
                    <td
                      key={ci}
                      title={`${rowCol} × ${numericCols[ci]}: ${r.toFixed(3)}`}
                      style={{ backgroundColor: colorFromCorr(r), color: textColor(r) }}
                      className="w-14 h-10 text-center text-xs font-mono border border-white dark:border-gray-900 cursor-default select-none"
                    >
                      {r.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>−1</span>
        <div className="h-3 w-40 rounded"
          style={{ background: "linear-gradient(to right, rgb(255,55,55), white, rgb(55,55,255))" }}
        />
        <span>+1</span>
      </div>
    </div>
  );
}
