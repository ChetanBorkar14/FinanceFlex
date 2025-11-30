"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

interface DashboardStatsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  accountsCount: number;
}

export function DashboardStats({
  totalBalance,
  totalIncome,
  totalExpenses,
  accountsCount,
}: DashboardStatsProps) {
  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Balance */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Balance
            </p>
            <p className="mt-2 text-3xl font-bold">
              ₹
              {totalBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {accountsCount} account{accountsCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-full bg-primary/20 p-3">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Total Income */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-emerald-500/10 to-emerald-500/5 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Income
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-500">
              ₹
              {totalIncome.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              This month
            </p>
          </div>
          <div className="rounded-full bg-emerald-500/20 p-3">
            <ArrowUpCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-red-500/10 to-red-500/5 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-500">
              ₹
              {totalExpenses.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-500">
              <TrendingDown className="h-3 w-3" />
              This month
            </p>
          </div>
          <div className="rounded-full bg-red-500/20 p-3">
            <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
        </div>
      </div>

      {/* Net Income */}
      <div
        className={`rounded-2xl border border-border p-6 shadow-sm ${
          netIncome >= 0
            ? "bg-linear-to-br from-blue-500/10 to-blue-500/5"
            : "bg-linear-to-br from-orange-500/10 to-orange-500/5"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Net Income
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                netIncome >= 0
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-orange-600 dark:text-orange-500"
              }`}
            >
              ₹
              {Math.abs(netIncome).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              className={`mt-1 flex items-center gap-1 text-xs ${
                netIncome >= 0
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-orange-600 dark:text-orange-500"
              }`}
            >
              {netIncome >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  Positive
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  Negative
                </>
              )}
            </p>
          </div>
          <div
            className={`rounded-full p-3 ${
              netIncome >= 0 ? "bg-blue-500/20" : "bg-orange-500/20"
            }`}
          >
            {netIncome >= 0 ? (
              <TrendingUp
                className={`h-6 w-6 ${
                  netIncome >= 0
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-orange-600 dark:text-orange-500"
                }`}
              />
            ) : (
              <TrendingDown
                className={`h-6 w-6 ${
                  netIncome >= 0
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-orange-600 dark:text-orange-500"
                }`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

