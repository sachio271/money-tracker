"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#f43f5e",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#818cf8",
  "#e879f9",
  "#94a3b8",
];

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type Entry = { name: string; total: number; percentage: number };

export default function ExpenseChart({
  data,
  title,
}: {
  data: Entry[];
  title: string;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-sm text-gray-400">
        No {title.toLowerCase()} this month
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h2 className="font-semibold text-gray-900">{title}</h2>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatIDR(Number(value ?? 0))}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{entry.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{entry.percentage}%</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatIDR(entry.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
