"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { updateAccount } from "./actions";

const accountTypes = [
  "checking",
  "savings",
  "credit card",
  "investment",
  "loan",
  "other",
];

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number | string;
  is_default: boolean;
}

interface EditAccountFormProps {
  account: Account;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditAccountForm({
  account,
  onCancel,
  onSuccess,
}: EditAccountFormProps) {
  const [state, formAction] = useActionState(updateAccount, null);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={account.id} />

        <label className="flex flex-col gap-1 text-sm font-medium">
          Account Name
          <input
            type="text"
            name="name"
            defaultValue={account.name}
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Account Type
          <select
            name="type"
            defaultValue={account.type}
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Balance
          <input
            type="number"
            name="balance"
            step="0.01"
            defaultValue={Number(account.balance)}
            required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_default"
            value="true"
            defaultChecked={account.is_default}
            className="size-4 rounded border-border"
          />
          Set as default account
        </label>

        {state?.error && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onCancel}
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
    <Button type="submit" size="sm" className="flex-1" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

