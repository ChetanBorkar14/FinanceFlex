"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useMemo } from "react";

interface Transaction {
  id: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
}

interface CategoryChartProps {
  transactions: Transaction[];
  type: "INCOME" | "EXPENSE";
}

const INCOME_COLORS = [
  "hsl(142, 76%, 36%)",
  "hsl(142, 70%, 45%)",
  "hsl(160, 64%, 46%)",
  "hsl(178, 63%, 50%)",
  "hsl(198, 72%, 55%)",
  "hsl(220, 70%, 58%)",
  "hsl(245, 60%, 62%)",
  "hsl(260, 55%, 65%)",
];

const EXPENSE_COLORS = [
  "hsl(0, 84%, 60%)",
  "hsl(14, 90%, 58%)",
  "hsl(24, 95%, 56%)",
  "hsl(38, 92%, 50%)",
  "hsl(45, 93%, 47%)",
  "hsl(280, 65%, 60%)",
  "hsl(335, 78%, 62%)",
  "hsl(350, 82%, 58%)",
];

function normalizeCategory(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function groupByCategory(
  transactions: Transaction[],
  type: "INCOME" | "EXPENSE"
) {
  const grouped = transactions
    .filter((t) => t.type === type && t.amount > 0)
    .reduce((acc, t) => {
      const cat = normalizeCategory(t.category);
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;

  const item = payload[0];
  const total = payload[0].payload.total;
  const percent = ((item.value / total) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-border bg-background/95 backdrop-blur-sm p-4 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-foreground">{item.name}</p>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          ₹
          {item.value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          {percent}% of total
        </p>
      </div>
    </div>
  );
};

const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      fontSize={14}
      fontWeight="600"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export function CategoryChart({ transactions, type }: CategoryChartProps) {
  const { chartData, total, isEmpty } = useMemo(() => {
    const data = groupByCategory(transactions, type);
    const sum = data.reduce((acc, item) => acc + item.value, 0);

    // Add total to each data point for tooltip calculations
    const dataWithTotal = data.map((item) => ({ ...item, total: sum }));

    return {
      chartData: dataWithTotal,
      total: sum,
      isEmpty: data.length === 0,
    };
  }, [transactions, type]);

  const colors = type === "INCOME" ? INCOME_COLORS : EXPENSE_COLORS;
  const bgGradient =
    type === "INCOME"
      ? "from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20"
      : "from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20";

  if (isEmpty) {
    return (
      <div
        className={`flex h-96 flex-col items-center justify-center rounded-2xl border border-border bg-linear-to-br ${bgGradient} shadow-sm transition-all hover:shadow-md`}
      >
        <div className="text-center space-y-2">
          <div
            className={`mx-auto h-16 w-16 rounded-full ${
              type === "INCOME"
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            } flex items-center justify-center`}
          >
            <svg
              className={`h-8 w-8 ${
                type === "INCOME"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No {type.toLowerCase()} transactions yet
          </p>
          <p className="text-xs text-muted-foreground/70">
            Data will appear here once you add transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-linear-to-br ${bgGradient} shadow-sm transition-all hover:shadow-md`}
    >
      <div className="p-6 pb-4">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize text-foreground">
              {type.toLowerCase()} by Category
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                type === "INCOME"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              {chartData.length}{" "}
              {chartData.length === 1 ? "category" : "categories"}
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₹
            {total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            Total {type.toLowerCase()}
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                outerRadius={95}
                innerRadius={55}
                labelLine={false}
                dataKey="value"
                label={CustomLabel}
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={colors[i % colors.length]}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend with fixed height and scroll */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
              {chartData.map((item, i) => {
                const percent = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹
                        {item.value.toLocaleString("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{" "}
                        ({percent}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
