"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAccount, toggleDefaultAccount } from "./actions";
import { EditAccountForm } from "./edit-account-form";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number | string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AccountsListProps {
  accounts: Account[];
}

export function AccountsList({ accounts }: AccountsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) {
      return;
    }

    setDeletingId(accountId);
    try {
      const result = await deleteAccount(accountId);
      if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleDefault = async (accountId: string) => {
    setTogglingId(accountId);
    try {
      const result = await toggleDefaultAccount(accountId);
      if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to toggle default status");
    } finally {
      setTogglingId(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center">
        <p className="text-muted-foreground mb-4">No accounts yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first account to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const balance = Number(account.balance || 0);
        const isEditing = editingId === account.id;
        const isDeleting = deletingId === account.id;
        const isToggling = togglingId === account.id;

        if (isEditing) {
          return (
            <EditAccountForm
              key={account.id}
              account={account}
              onCancel={() => setEditingId(null)}
              onSuccess={() => setEditingId(null)}
            />
          );
        }

        return (
          <div
            key={account.id}
            className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{account.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {account.type}
                </p>
              </div>
              <button
                onClick={() => handleToggleDefault(account.id)}
                disabled={isToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  account.is_default
                    ? "bg-primary"
                    : "bg-muted"
                } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={account.is_default ? "Remove default" : "Set as default"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    account.is_default ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-semibold mt-1">
                ₹{balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setEditingId(account.id)}
                disabled={isDeleting}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(account.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

