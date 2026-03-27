"use client";

import { ColumnStats } from "@/types/data";
import { formatNumber } from "@/lib/dataUtils";

interface Props {
  stats: ColumnStats[];
}

export default function StatsSummary({ stats }: Props) {
  const numeric = stats.filter((s) => s.type === "numeric");
  const categorical = stats.filter((s) => s.type === "categorical");

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Colonnes" value={stats.length} />
        <StatCard label="Numériques" value={numeric.length} accent="blue" />
        <StatCard label="Catégorielles" value={categorical.length} accent="purple" />
        <StatCard
          label="Valeurs manquantes"
          value={stats.reduce((s, c) => s + c.missing, 0)}
          accent="orange"
        />
      </div>

      {/* Numeric stats table */}
      {numeric.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Statistiques numériques
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {["Colonne", "N", "Manquants", "Min", "Q1", "Médiane", "Moyenne", "Q3", "Max", "Écart-type"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numeric.map((s) => (
                  <tr key={s.column} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2 font-medium">{s.column}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.count.toLocaleString("fr-FR")}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${s.missing > 0 ? "text-orange-500" : ""}`}>
                      {s.missing > 0 ? s.missing : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(s.min)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(s.q1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{formatNumber(s.median)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{formatNumber(s.mean)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(s.q3)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(s.max)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-500">{formatNumber(s.stdDev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorical columns */}
      {categorical.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Colonnes catégorielles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorical.map((s) => (
              <div key={s.column} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm truncate">{s.column}</span>
                  <span className="text-xs text-gray-400">{s.unique} valeurs uniques</span>
                </div>
                {s.missing > 0 && (
                  <div className="text-xs text-orange-500 mb-2">{s.missing} manquant(s)</div>
                )}
                <div className="space-y-1">
                  {s.topValues?.map(({ value, count }) => {
                    const pct = s.count > 0 ? (count / s.count) * 100 : 0;
                    return (
                      <div key={value}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="truncate max-w-[140px]" title={value}>{value}</span>
                          <span className="text-gray-500 tabular-nums">{count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "blue" | "purple" | "orange";
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className={`text-2xl font-bold tabular-nums ${accent ? colors[accent] : ""}`}>
        {value.toLocaleString("fr-FR")}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
