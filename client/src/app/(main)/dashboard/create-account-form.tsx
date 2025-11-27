"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { createAccount } from "./actions";

const accountTypes = [
  "checking",
  "savings",
  "credit card",
  "investment",
  "loan",
  "other",
];

export function CreateAccountForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createAccount, null);

  if (state?.success) {
    // Close modal after a brief delay to show success message
    setTimeout(() => setIsOpen(false), 1000);
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>Create Account</Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Account</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Account Name
            <input
              type="text"
              name="name"
              placeholder="e.g., Chase Checking"
              required
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Account Type
            <select
              name="type"
              required
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="">Select type</option>
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Initial Balance
            <input
              type="number"
              name="balance"
              step="0.01"
              placeholder="0.00"
              required
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_default"
              value="true"
              className="size-4 rounded border-border"
            />
            Set as default account
          </label>

          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}

          {state?.success && (
            <p className="text-sm font-medium text-primary">
              Account created successfully!
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="flex-1" disabled={pending}>
      {pending ? "Creating..." : "Create Account"}
    </Button>
  );
}

