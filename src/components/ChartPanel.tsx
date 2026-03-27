"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Label,
} from "recharts";
import { DataRow, ColumnStats, ChartType } from "@/types/data";
import { buildHistogramBins } from "@/lib/dataUtils";

const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
];

interface Props {
  rows: DataRow[];
  stats: ColumnStats[];
  headers: string[];
}

export default function ChartPanel({ rows, stats, headers }: Props) {
  const numericCols = stats.filter((s) => s.type === "numeric").map((s) => s.column);
  const categoricalCols = stats.filter((s) => s.type === "categorical").map((s) => s.column);

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xCol, setXCol] = useState<string>(categoricalCols[0] ?? headers[0] ?? "");
  const [yCol, setYCol] = useState<string>(numericCols[0] ?? "");
  const [yCol2, setYCol2] = useState<string>(numericCols[1] ?? "");
  const [aggFunc, setAggFunc] = useState<"sum" | "mean" | "count">("sum");
  const [histCol, setHistCol] = useState<string>(numericCols[0] ?? "");
  const [histBins, setHistBins] = useState(20);
  const [scatterX, setScatterX] = useState<string>(numericCols[0] ?? "");
  const [scatterY, setScatterY] = useState<string>(numericCols[1] ?? numericCols[0] ?? "");
  const [colorCol, setColorCol] = useState<string>("");

  // Aggregate data for bar/line/pie
  const aggData = useMemo(() => {
    if (!xCol || !yCol) return [];
    const groups: Record<string, { sum: number; count: number }> = {};
    rows.forEach((r) => {
      const key = String(r[xCol] ?? "N/A");
      const val = Number(r[yCol]);
      if (!groups[key]) groups[key] = { sum: 0, count: 0 };
      if (!isNaN(val)) {
        groups[key].sum += val;
        groups[key].count++;
      } else {
        groups[key].count++;
      }
    });
    return Object.entries(groups)
      .map(([name, g]) => ({
        name,
        value: aggFunc === "sum" ? g.sum : aggFunc === "mean" ? (g.count ? g.sum / g.count : 0) : g.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);
  }, [rows, xCol, yCol, aggFunc]);

  // For line chart with dual Y
  const lineData = useMemo(() => {
    if (!xCol || !yCol) return [];
    const groups: Record<string, { sum1: number; sum2: number; count: number }> = {};
    rows.forEach((r) => {
      const key = String(r[xCol] ?? "N/A");
      const v1 = Number(r[yCol]);
      const v2 = yCol2 ? Number(r[yCol2]) : NaN;
      if (!groups[key]) groups[key] = { sum1: 0, sum2: 0, count: 0 };
      groups[key].count++;
      if (!isNaN(v1)) groups[key].sum1 += v1;
      if (!isNaN(v2)) groups[key].sum2 += v2;
    });
    return Object.entries(groups)
      .map(([name, g]) => ({
        name,
        [yCol]: aggFunc === "sum" ? g.sum1 : aggFunc === "mean" ? g.sum1 / g.count : g.count,
        ...(yCol2 ? { [yCol2]: aggFunc === "sum" ? g.sum2 : aggFunc === "mean" ? g.sum2 / g.count : g.count } : {}),
      }))
      .slice(0, 50);
  }, [rows, xCol, yCol, yCol2, aggFunc]);

  const histData = useMemo(() => {
    if (!histCol) return [];
    const vals = rows.map((r) => Number(r[histCol])).filter((n) => !isNaN(n));
    return buildHistogramBins(vals, histBins);
  }, [rows, histCol, histBins]);

  const scatterData = useMemo(() => {
    if (!scatterX || !scatterY) return { all: [], byColor: [] };
    if (colorCol) {
      const groups: Record<string, { x: number; y: number }[]> = {};
      rows.forEach((r) => {
        const x = Number(r[scatterX]);
        const y = Number(r[scatterY]);
        if (isNaN(x) || isNaN(y)) return;
        const key = String(r[colorCol] ?? "N/A");
        if (!groups[key]) groups[key] = [];
        groups[key].push({ x, y });
      });
      return { all: [], byColor: Object.entries(groups).map(([name, data]) => ({ name, data })) };
    }
    const all = rows
      .map((r) => ({ x: Number(r[scatterX]), y: Number(r[scatterY]) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y))
      .slice(0, 2000);
    return { all, byColor: [] };
  }, [rows, scatterX, scatterY, colorCol]);

  const chartTypes: { id: ChartType; label: string; icon: string }[] = [
    { id: "bar", label: "Barres", icon: "📊" },
    { id: "line", label: "Lignes", icon: "📈" },
    { id: "pie", label: "Camembert", icon: "🥧" },
    { id: "scatter", label: "Nuage", icon: "✦" },
    { id: "histogram", label: "Histogramme", icon: "📉" },
  ];

  return (
    <div className="space-y-4">
      {/* Chart type selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setChartType(ct.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 border transition-colors
              ${chartType === ct.id
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <span>{ct.icon}</span> {ct.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        {(chartType === "bar" || chartType === "line" || chartType === "pie") && (
          <>
            <Select label="Axe X / Catégorie" value={xCol} onChange={setXCol} options={headers} />
            <Select label="Axe Y (valeur)" value={yCol} onChange={setYCol} options={numericCols} />
            {chartType === "line" && (
              <Select label="2ème Y (optionnel)" value={yCol2} onChange={setYCol2} options={["", ...numericCols]} />
            )}
            <Select
              label="Agrégation"
              value={aggFunc}
              onChange={(v) => setAggFunc(v as "sum" | "mean" | "count")}
              options={["sum", "mean", "count"]}
              labels={{ sum: "Somme", mean: "Moyenne", count: "Nombre" }}
            />
          </>
        )}
        {chartType === "histogram" && (
          <>
            <Select label="Colonne numérique" value={histCol} onChange={setHistCol} options={numericCols} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Bins ({histBins})</label>
              <input
                type="range" min={5} max={100} value={histBins}
                onChange={(e) => setHistBins(Number(e.target.value))}
                className="w-32"
              />
            </div>
          </>
        )}
        {chartType === "scatter" && (
          <>
            <Select label="Axe X" value={scatterX} onChange={setScatterX} options={numericCols} />
            <Select label="Axe Y" value={scatterY} onChange={setScatterY} options={numericCols} />
            <Select label="Couleur par" value={colorCol} onChange={setColorCol} options={["", ...categoricalCols]} />
          </>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "bar" ? (
            <BarChart data={aggData} margin={{ top: 10, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }}>
                <Label value={yCol} angle={-90} position="insideLeft" style={{ fontSize: 11 }} />
              </YAxis>
              <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : String(v ?? "")} />
              <Bar dataKey="value" name={yCol} fill={COLORS[0]} radius={[4, 4, 0, 0]}>
                {aggData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={lineData} margin={{ top: 10, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : String(v ?? "")} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey={yCol} stroke={COLORS[0]} dot={false} strokeWidth={2} />
              {yCol2 && <Line type="monotone" dataKey={yCol2} stroke={COLORS[1]} dot={false} strokeWidth={2} />}
            </LineChart>
          ) : chartType === "pie" ? (
            <PieChart>
              <Pie
                data={aggData.slice(0, 15)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`}
                labelLine={true}
              >
                {aggData.slice(0, 15).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : String(v ?? "")} />
            </PieChart>
          ) : chartType === "histogram" ? (
            <BarChart data={histData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} interval={Math.floor(histBins / 10)} />
              <YAxis tick={{ fontSize: 11 }}>
                <Label value="Fréquence" angle={-90} position="insideLeft" style={{ fontSize: 11 }} />
              </YAxis>
              <Tooltip />
              <Bar dataKey="count" name="Fréquence" fill={COLORS[0]} />
            </BarChart>
          ) : (
            // Scatter
            <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="x" name={scatterX} tick={{ fontSize: 11 }}>
                <Label value={scatterX} position="insideBottom" offset={-10} style={{ fontSize: 11 }} />
              </XAxis>
              <YAxis dataKey="y" name={scatterY} tick={{ fontSize: 11 }}>
                <Label value={scatterY} angle={-90} position="insideLeft" style={{ fontSize: 11 }} />
              </YAxis>
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {scatterData.byColor.length > 0 ? (
                <>
                  <Legend />
                  {scatterData.byColor.map((g, i) => (
                    <Scatter key={g.name} name={g.name} data={g.data} fill={COLORS[i % COLORS.length]} opacity={0.7} />
                  ))}
                </>
              ) : (
                <Scatter data={scatterData.all} fill={COLORS[0]} opacity={0.6} />
              )}
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Select({
  label, value, onChange, options, labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>{(labels?.[o] ?? o) || "(aucun)"}</option>
        ))}
      </select>
    </div>
  );
}
