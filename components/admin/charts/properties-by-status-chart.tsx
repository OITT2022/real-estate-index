"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#16a34a",
  DRAFT: "#94a3b8",
  SOLD: "#2563eb",
  ARCHIVED: "#dc2626",
};

interface Props {
  data: { status: string; count: number }[];
}

export function PropertiesByStatusChart({ data }: Props) {
  if (data.length === 0) return <p className="muted" style={{ fontSize: "0.8rem" }}>No data</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [String(value), "Properties"]} />
        <Legend
          formatter={(value: string) => <span style={{ fontSize: "0.75rem" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
