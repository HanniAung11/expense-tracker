"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CATEGORIES } from "@/types";

interface PieChartData {
  category: string;
  value: number;
}

interface ExpensePieChartProps {
  data: PieChartData[];
}

const COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ef4444", // red
  "#eab308", // yellow
  "#ec4899", // pink
  "#22c55e", // green
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#6b7280", // gray
];

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(typeof value === "number" ? value : Number(value ?? 0))
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

