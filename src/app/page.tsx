"use client";

import { useState, useMemo } from "react";
import DataUpload from "@/components/DataUpload";
import DataTable from "@/components/DataTable";
import StatsSummary from "@/components/StatsSummary";
import ChartPanel from "@/components/ChartPanel";
import CorrelationMatrix from "@/components/CorrelationMatrix";
import FilterPanel from "@/components/FilterPanel";
import ExportPanel from "@/components/ExportPanel";
import { DataSet, FilterConfig } from "@/types/data";
import { computeStats, applyFilters } from "@/lib/dataUtils";

type Tab = "data" | "stats" | "charts" | "correlation" | "export";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "data", label: "Données", icon: "🗂️" },
  { id: "stats", label: "Statistiques", icon: "📐" },
  { id: "charts", label: "Graphiques", icon: "📊" },
  { id: "correlation", label: "Corrélations", icon: "🔗" },
  { id: "export", label: "Exporter", icon: "⬇️" },
];

export default function DashboardPage() {
  const [dataset, setDataset] = useState<DataSet | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("data");

  const stats = useMemo(
    () => (dataset ? computeStats(dataset.headers, dataset.rows) : []),
    [dataset]
  );

  const filteredRows = useMemo(
    () => (dataset ? applyFilters(dataset.rows, filters) : []),
    [dataset, filters]
  );

  const filteredStats = useMemo(
    () => (dataset ? computeStats(dataset.headers, filteredRows) : []),
    [dataset, filteredRows]
  );

  function handleNewFile() {
    setDataset(null);
    setFilters([]);
    setActiveTab("data");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="font-bold text-lg tracking-tight">AnalystD</span>
            {dataset && (
              <span className="hidden sm:inline text-xs text-gray-400 ml-3 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {dataset.fileName} · {dataset.rows.length.toLocaleString("fr-FR")} lignes · {dataset.headers.length} colonnes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {dataset && (
              <button
                onClick={handleNewFile}
                className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ← Nouveau fichier
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {!dataset ? (
          /* Upload screen */
          <div className="flex flex-col items-center gap-8 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Dashboard Data Analyst</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Importez vos données CSV ou Excel pour les explorer, visualiser et analyser en quelques secondes.
              </p>
            </div>
            <DataUpload onDataLoaded={(d) => { setDataset(d); setActiveTab("data"); }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl mt-4">
              {[
                { icon: "🔍", label: "Exploration", desc: "Tableau interactif avec tri et recherche" },
                { icon: "📐", label: "Statistiques", desc: "Moyenne, médiane, écart-type, quartiles…" },
                { icon: "📊", label: "Graphiques", desc: "Barres, lignes, camembert, nuage de points" },
                { icon: "🔗", label: "Corrélations", desc: "Matrice de corrélation de Pearson" },
              ].map((f) => (
                <div key={f.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <div className="font-semibold text-sm mb-1">{f.label}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Dashboard */
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">🔎 Filtres</span>
                {filters.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                    {filters.length}
                  </span>
                )}
                {filters.length > 0 && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {filteredRows.length.toLocaleString("fr-FR")} / {dataset.rows.length.toLocaleString("fr-FR")} lignes
                  </span>
                )}
              </div>
              <FilterPanel
                headers={dataset.headers}
                filters={filters}
                onChange={setFilters}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6">
              {activeTab === "data" && (
                <DataTable headers={dataset.headers} rows={filteredRows} />
              )}
              {activeTab === "stats" && (
                <StatsSummary stats={filteredStats} />
              )}
              {activeTab === "charts" && (
                <ChartPanel rows={filteredRows} stats={filteredStats} headers={dataset.headers} />
              )}
              {activeTab === "correlation" && (
                <CorrelationMatrix rows={filteredRows} stats={filteredStats} />
              )}
              {activeTab === "export" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Exporter les données filtrées</h3>
                    <ExportPanel
                      headers={dataset.headers}
                      rows={filteredRows}
                      fileName={dataset.fileName}
                    />
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <h3 className="font-semibold mb-2">Résumé du jeu de données</h3>
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      {[
                        { label: "Fichier", value: dataset.fileName },
                        { label: "Lignes totales", value: dataset.rows.length.toLocaleString("fr-FR") },
                        { label: "Lignes filtrées", value: filteredRows.length.toLocaleString("fr-FR") },
                        { label: "Colonnes", value: dataset.headers.length },
                        { label: "Numériques", value: stats.filter((s) => s.type === "numeric").length },
                        { label: "Catégorielles", value: stats.filter((s) => s.type === "categorical").length },
                        {
                          label: "Valeurs manquantes",
                          value: stats.reduce((s, c) => s + c.missing, 0).toLocaleString("fr-FR"),
                        },
                        {
                          label: "Taux de complétude",
                          value: (() => {
                            const total = dataset.rows.length * dataset.headers.length;
                            const missing = stats.reduce((s, c) => s + c.missing, 0);
                            return total > 0 ? ((1 - missing / total) * 100).toFixed(1) + "%" : "—";
                          })(),
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <dt className="text-xs text-gray-500 mb-1">{label}</dt>
                          <dd className="font-semibold truncate">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-6 text-center text-xs text-gray-400">
        AnalystD — Dashboard Data Analyst · Données traitées localement dans votre navigateur
      </footer>
    </div>
  );
}
