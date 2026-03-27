import { DataRow, ColumnStats, FilterConfig } from "@/types/data";

export function detectColumnType(
  values: (string | number | null)[]
): "numeric" | "categorical" {
  const nonNull = values.filter((v) => v !== null && v !== "");
  const numericCount = nonNull.filter((v) => !isNaN(Number(v))).length;
  return numericCount / nonNull.length > 0.8 ? "numeric" : "categorical";
}

export function computeStats(headers: string[], rows: DataRow[]): ColumnStats[] {
  return headers.map((col) => {
    const rawValues = rows.map((r) => r[col]);
    const missing = rawValues.filter((v) => v === null || v === "").length;
    const nonNull = rawValues.filter((v) => v !== null && v !== "") as (string | number)[];
    const unique = new Set(nonNull.map(String)).size;
    const type = detectColumnType(rawValues);

    if (type === "numeric") {
      const nums = nonNull.map(Number).filter((n) => !isNaN(n)).sort((a, b) => a - b);
      const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
      const variance =
        nums.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / nums.length;
      const stdDev = Math.sqrt(variance);
      const median = getPercentile(nums, 50);
      const q1 = getPercentile(nums, 25);
      const q3 = getPercentile(nums, 75);
      return {
        column: col,
        type,
        count: nums.length,
        missing,
        unique,
        min: nums[0],
        max: nums[nums.length - 1],
        mean,
        median,
        stdDev,
        q1,
        q3,
      };
    } else {
      const freq: Record<string, number> = {};
      nonNull.forEach((v) => {
        const key = String(v);
        freq[key] = (freq[key] || 0) + 1;
      });
      const topValues = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([value, count]) => ({ value, count }));
      return { column: col, type, count: nonNull.length, missing, unique, topValues };
    }
  });
}

function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function applyFilters(rows: DataRow[], filters: FilterConfig[]): DataRow[] {
  return rows.filter((row) =>
    filters.every((f) => {
      const cellVal = row[f.column];
      const val = cellVal !== null ? String(cellVal) : "";
      const numCell = Number(cellVal);
      const numFilter = Number(f.value);
      switch (f.operator) {
        case "eq":
          return val === f.value;
        case "ne":
          return val !== f.value;
        case "contains":
          return val.toLowerCase().includes(f.value.toLowerCase());
        case "not_contains":
          return !val.toLowerCase().includes(f.value.toLowerCase());
        case "gt":
          return numCell > numFilter;
        case "gte":
          return numCell >= numFilter;
        case "lt":
          return numCell < numFilter;
        case "lte":
          return numCell <= numFilter;
        default:
          return true;
      }
    })
  );
}

export function computeCorrelation(
  rows: DataRow[],
  colA: string,
  colB: string
): number {
  const pairs = rows
    .map((r) => [Number(r[colA]), Number(r[colB])])
    .filter(([a, b]) => !isNaN(a) && !isNaN(b));
  if (pairs.length < 2) return 0;
  const n = pairs.length;
  const meanA = pairs.reduce((s, p) => s + p[0], 0) / n;
  const meanB = pairs.reduce((s, p) => s + p[1], 0) / n;
  const num = pairs.reduce((s, p) => s + (p[0] - meanA) * (p[1] - meanB), 0);
  const denA = Math.sqrt(pairs.reduce((s, p) => s + Math.pow(p[0] - meanA, 2), 0));
  const denB = Math.sqrt(pairs.reduce((s, p) => s + Math.pow(p[1] - meanB, 2), 0));
  return denA * denB === 0 ? 0 : num / (denA * denB);
}

export function buildHistogramBins(
  values: number[],
  bins = 20
): { range: string; count: number; x0: number; x1: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / bins || 1;
  const result = Array.from({ length: bins }, (_, i) => ({
    x0: min + i * step,
    x1: min + (i + 1) * step,
    range: `${(min + i * step).toFixed(2)}`,
    count: 0,
  }));
  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1);
    result[idx].count++;
  });
  return result;
}

export function formatNumber(n: number | undefined, decimals = 2): string {
  if (n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
