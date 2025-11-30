"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
}

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

function groupByMonth(transactions: Transaction[]) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    if (!grouped[monthKey]) {
      grouped[monthKey] = { income: 0, expense: 0 };
    }

    if (t.type === "INCOME") {
      grouped[monthKey].income += t.amount;
    } else {
      grouped[monthKey].expense += t.amount;
    }
  });

  return Object.entries(grouped)
    .map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-4 shadow-lg">
        <p className="mb-2 text-sm font-semibold">{payload[0].payload.month}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-semibold">
                ₹
                {Number(entry.value).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const chartData = groupByMonth(transactions);

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-card">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Income vs Expenses Trend</h3>
        <p className="text-sm text-muted-foreground">
          Monthly comparison over time
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              fontSize={12}
              className="text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              fontSize={12}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={3}
              dot={{ fill: "hsl(142, 76%, 36%)", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={3}
              dot={{ fill: "hsl(0, 84%, 60%)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

