"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

type Transaction = {
  id: string;
  description: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  status: string;
  isRecurring?: boolean;
  date: string;
};

interface TransactionChartProps {
  transactions: Transaction[];
}

type DateRangeType = "week" | "month";

// Helper functions for date range calculations
function getWeekRange(date: Date): { start: Date; end: Date } {
  const dateCopy = new Date(date);
  const day = dateCopy.getDay();
  const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const start = new Date(dateCopy.getFullYear(), dateCopy.getMonth(), diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDateRange(start: Date, end: Date, type: DateRangeType): string {
  if (type === "week") {
    return `${start.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })} - ${end.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  } else {
    return start.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }
}

// Helper to format currency for axis and tooltip
const currencyFormatter = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-background p-4 shadow-lg">
        <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="font-semibold text-foreground">
                {currencyFormatter(Number(entry.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function groupTransactionsByDate(transactions: Transaction[]) {
  const grouped: Record<string, { INCOME: number; EXPENSE: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    if (!grouped[date]) grouped[date] = { INCOME: 0, EXPENSE: 0 };
    grouped[date][t.type] += t.amount;
  });

  return Object.entries(grouped).map(([date, values]) => ({
    date,
    ...values,
  }));
}

export default function TransactionBarChart({
  transactions,
}: TransactionChartProps) {
  const [rangeType, setRangeType] = React.useState<DateRangeType>("month");
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Get current range based on type
  const getCurrentRange = () => {
    if (rangeType === "week") {
      return getWeekRange(new Date(currentDate));
    } else {
      return getMonthRange(new Date(currentDate));
    }
  };

  const { start, end } = getCurrentRange();

  // Filter transactions based on current range
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  const chartData = groupTransactionsByDate(filteredTransactions);

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpense;

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (rangeType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (rangeType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (transactions.length === 0) {
    return (
      <div className="w-full h-96 mt-8 rounded-lg bg-card flex flex-col items-center justify-center text-muted-foreground p-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4 opacity-20"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <p className="text-lg font-medium mb-1">No Data Available</p>
        <p className="text-sm">Create a transaction to see the chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Single Unified Card */}
      <div className="rounded-lg bg-card p-6">
        {/* Header with Controls and Summary Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          {/* Left: Period Selector */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg p-1 bg-muted/30">
                <Button
                  variant={rangeType === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setRangeType("week");
                    setCurrentDate(new Date());
                  }}
                  className="h-8"
                >
                  Week
                </Button>
                <Button
                  variant={rangeType === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setRangeType("month");
                    setCurrentDate(new Date());
                  }}
                  className="h-8"
                >
                  Month
                </Button>
              </div>
            </div>

            {/* Date Range Display with Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="h-8 w-8"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 min-w-[200px] justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {formatDateRange(start, end, rangeType)}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="h-8 w-8"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="ml-2"
              >
                Today
              </Button>
            </div>
          </div>

          {/* Right: Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <p className="text-xs text-muted-foreground mb-1">Total Income</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                {currencyFormatter(totalIncome)}
              </p>
            </div>

            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-xs text-muted-foreground mb-1">
                Total Expense
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-500">
                {currencyFormatter(totalExpense)}
              </p>
            </div>

            <div
              className={`text-center p-3 rounded-lg ${
                netAmount >= 0
                  ? "bg-blue-50 dark:bg-blue-950/20"
                  : "bg-orange-50 dark:bg-orange-950/20"
              }`}
            >
              <p className="text-xs text-muted-foreground mb-1">Net Amount</p>
              <p
                className={`text-lg font-bold ${
                  netAmount >= 0
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-orange-600 dark:text-orange-500"
                }`}
              >
                {currencyFormatter(Math.abs(netAmount))}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.15}
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                fontSize={12}
                className="text-muted-foreground"
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                fontSize={12}
                className="text-muted-foreground"
                width={60}
              />

              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                content={<CustomTooltip />}
              />

              <Legend
                verticalAlign="top"
                height={40}
                iconType="circle"
                iconSize={10}
                wrapperStyle={{
                  paddingBottom: "20px",
                }}
              />

              <Bar
                dataKey="INCOME"
                name="Income"
                fill="hsl(142, 76%, 36%)"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="EXPENSE"
                name="Expense"
                fill="hsl(0, 84%, 60%)"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
