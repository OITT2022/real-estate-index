"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { city: string; count: number }[];
}

export function PropertiesByCityChart({ data }: Props) {
  if (data.length === 0) return <p className="muted" style={{ fontSize: "0.8rem" }}>No data</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="city" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(value) => [String(value), "Properties"]}
        />
        <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
