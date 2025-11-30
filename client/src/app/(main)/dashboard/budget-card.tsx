"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBudget, updateBudget, deleteBudget } from "./budget-actions";
import {
  Edit2,
  Trash2,
  Target,
  TrendingUp,
  TrendingDown,
  Lightbulb,
} from "lucide-react";

interface Budget {
  id: string;
  amount: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface BudgetCardProps {
  budget: Budget | null;
  totalExpenses: number;
}

export function BudgetCard({ budget, totalExpenses }: BudgetCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [state, formAction] = useActionState(
    budget ? updateBudget : createBudget,
    null
  );
  const hasHandledSuccess = useRef(false);

  useEffect(() => {
    if (state?.success && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      const timeoutId = setTimeout(() => {
        setIsEditing(false);
        router.refresh();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // Reset the ref when state changes to non-success
    if (!state?.success) {
      hasHandledSuccess.current = false;
    }
  }, [state?.success, router]);

  const handleDelete = async () => {
    if (!budget) return;
    if (!confirm("Are you sure you want to delete your budget?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteBudget(budget.id);
      if (result.error) alert(result.error);
      else router.refresh();
    } catch {
      alert("Failed to delete budget");
    } finally {
      setIsDeleting(false);
    }
  };

  // -----------------------
  // ADD SUGGESTION LOGIC
  // -----------------------
  const getBudgetSuggestion = (p: number, remaining: number) => {
    if (p < 30)
      return "Great start! You're spending cautiously. Keep this pace to end the month with strong savings.";
    if (p < 60)
      return "You're managing well. Try reviewing optional expenses to stay ahead.";
    if (p < 90)
      return "You're getting close to your limit. Reduce non-essential spending for the remaining month.";
    if (p < 100)
      return "Warning! You’re about to reach your budget. Plan expenses carefully.";
    if (p >= 100 && remaining < 0)
      return "You've exceeded your budget. Consider reviewing your expenses and adjusting next month’s budget.";
  };

  // -----------------------
  // Editing form
  // -----------------------
  if (isEditing && budget) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Budget</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={budget.id} />

          <label className="flex flex-col gap-2 text-sm font-medium">
            Monthly Budget (₹)
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              defaultValue={budget.amount}
              required
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>

          {state?.error && (
            <p className="text-sm font-medium text-destructive">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm font-medium text-primary">
              Budget updated successfully!
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    );
  }

  // -----------------------
  // No budget form
  // -----------------------
  if (!budget) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Set a monthly budget to track your spending
        </p>

        <form action={formAction} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Monthly Budget (₹)
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              placeholder="10000.00"
              required
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>

          {state?.error && (
            <p className="text-sm font-medium text-destructive">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm font-medium text-primary">
              Budget created successfully!
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    );
  }

  // -----------------------
  // BUDGET DISPLAY
  // -----------------------
  const budgetAmount = Number(budget.amount);
  const spent = totalExpenses;
  const remaining = budgetAmount - spent;
  const percentageUsed = (spent / budgetAmount) * 100;
  const isOverBudget = spent > budgetAmount;

  const suggestionText = getBudgetSuggestion(percentageUsed, remaining);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsEditing(true)}
            title="Edit budget"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete budget"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Amounts */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-semibold">
              ₹
              {budgetAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span
              className={`font-semibold ${
                isOverBudget ? "text-destructive" : "text-foreground"
              }`}
            >
              ₹{spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span
              className={`font-semibold ${
                remaining < 0
                  ? "text-destructive"
                  : remaining < budgetAmount * 0.2
                  ? "text-orange-500"
                  : "text-emerald-600"
              }`}
            >
              ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {percentageUsed.toFixed(1)}% used
            </span>

            {isOverBudget ? (
              <span className="flex items-center gap-1 text-destructive">
                <TrendingUp className="h-3 w-3" />
                Over budget
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingDown className="h-3 w-3" />
                On track
              </span>
            )}
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${
                isOverBudget
                  ? "bg-destructive"
                  : percentageUsed > 80
                  ? "bg-orange-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* -------------------------------
             SMART SUGGESTION SECTION
        -------------------------------- */}
        <div className="mt-6 rounded-xl bg-background/50 p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Suggestion</p>
          </div>

          <p className="text-m text-muted-foreground leading-relaxed">
            {suggestionText}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit">{pending ? "Saving..." : "Save Budget"}</Button>;
}
