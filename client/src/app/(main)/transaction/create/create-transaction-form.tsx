"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createTransaction } from "../actions";

const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "investments",
  "other-income",
];

const EXPENSE_CATEGORIES = [
  "housing",
  "transportation",
  "groceries",
  "utilities",
  "entertainment",
  "food",
  "shopping",
  "healthcare",
  "education",
  "travel",
];

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  is_default: boolean;
}

interface CreateTransactionFormProps {
  accounts: Account[];
}

export function CreateTransactionForm({
  accounts,
}: CreateTransactionFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createTransaction, null);
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE"
  );

  const categories =
    transactionType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (state?.success) {
    // Redirect to dashboard after successful creation
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <form action={formAction} className="space-y-5">
        {/* Account Selection */}
        <label className="flex flex-col gap-2 text-sm font-medium">
          Account
          <select
            name="account_id"
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type}) - ₹{account.balance.toFixed(2)}
                {account.is_default ? " (Default)" : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Transaction Type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Type</label>
          <div className="inline-flex rounded-lg p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => setTransactionType("INCOME")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                transactionType === "INCOME"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("EXPENSE")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                transactionType === "EXPENSE"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Expense
            </button>
          </div>
          <input type="hidden" name="type" value={transactionType} />
        </div>

        {/* Amount */}
        <label className="flex flex-col gap-2 text-sm font-medium">
          Amount (₹)
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        {/* Description */}
        <label className="flex flex-col gap-2 text-sm font-medium">
          Description
          <input
            type="text"
            name="description"
            placeholder="e.g., Grocery shopping"
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        {/* Category */}
        <label className="flex flex-col gap-2 text-sm font-medium">
          Category
          <select
            name="category"
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() +
                  category.slice(1).replace("-", " ")}
              </option>
            ))}
          </select>
        </label>

        {/* Date */}
        <label className="flex flex-col gap-2 text-sm font-medium">
          Date
          <input
            type="date"
            name="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        {/* Recurring */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_recurring"
            value="true"
            className="size-4 rounded border-border accent-primary"
          />
          This is a recurring transaction
        </label>

        {state?.error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">
            Transaction created successfully! Redirecting...
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="flex-1" disabled={pending}>
      {pending ? "Creating..." : "Create Transaction"}
    </Button>
  );
}
