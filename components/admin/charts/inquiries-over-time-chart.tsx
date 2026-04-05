"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; count: number }[];
}

export function InquiriesOverTimeChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="inquiryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(value) => [String(value), "Inquiries"]}
        />
        <Area type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} fill="url(#inquiryGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
