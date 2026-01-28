"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartData {
  month: string;
  total: number;
}

interface ExpenseBarChartProps {
  data: BarChartData[];
}

export function ExpenseBarChart({ data }: ExpenseBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickFormatter={(value) => {
            const date = new Date(value + "-01");
            return date.toLocaleDateString("en-US", { month: "short" });
          }}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(typeof value === "number" ? value : Number(value ?? 0))
          }
        />
        <Bar dataKey="total" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

