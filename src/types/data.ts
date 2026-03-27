export type DataRow = Record<string, string | number | null>;

export interface DataSet {
  headers: string[];
  rows: DataRow[];
  fileName: string;
}

export interface ColumnStats {
  column: string;
  type: "numeric" | "categorical";
  count: number;
  missing: number;
  unique: number;
  // numeric
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  q1?: number;
  q3?: number;
  // categorical
  topValues?: { value: string; count: number }[];
}

export interface FilterConfig {
  column: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "not_contains";
  value: string;
}

export type ChartType = "bar" | "line" | "pie" | "scatter" | "histogram";
