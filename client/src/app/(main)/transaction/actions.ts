"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);
  if (!session?.sub) {
    redirect("/login");
  }

  return session.sub;
}

export async function createTransaction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  if (!formData) {
    return { error: "Invalid form data." };
  }

  const accountIdValue = formData.get("account_id");
  const typeValue = formData.get("type");
  const amountValue = formData.get("amount");
  const descriptionValue = formData.get("description");
  const categoryValue = formData.get("category");
  const dateValue = formData.get("date");
  const isRecurringValue = formData.get("is_recurring");

  const accountId = typeof accountIdValue === "string" ? accountIdValue.trim() : "";
  const type = typeof typeValue === "string" ? typeValue.trim() : "";
  const amount = typeof amountValue === "string" ? amountValue.trim() : "";
  const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const category = typeof categoryValue === "string" ? categoryValue.trim() : "";
  const date = typeof dateValue === "string" ? dateValue.trim() : "";
  const isRecurring = isRecurringValue === "true" || isRecurringValue === "on";

  if (!accountId || !type || !amount || !description || !category || !date) {
    return { error: "All fields are required." };
  }

  if (type !== "INCOME" && type !== "EXPENSE") {
    return { error: "Type must be either INCOME or EXPENSE." };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { error: "Amount must be a valid positive number." };
  }

  // Verify account belongs to user
  const { data: account } = await supabase
    .from("accounts")
    .select("id, balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) {
    return { error: "Account not found." };
  }

  // Create transaction
  const transactionId = randomUUID();
  const now = new Date().toISOString();
  const transactionDate = new Date(date).toISOString();

  const { error: insertError } = await supabase.from("transactions").insert({
    id: transactionId,
    user_id: userId,
    account_id: accountId,
    type,
    kind: type,
    amount: amountNum,
    description,
    category,
    date: transactionDate,
    status: "COMPLETED",
    is_recurring: isRecurring,
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    return { error: "Failed to create transaction. Please try again." };
  }

  // Update account balance
  const balanceChange = type === "INCOME" ? amountNum : -amountNum;
  const newBalance = account.balance + balanceChange;

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", accountId);

  if (updateError) {
    // Rollback transaction if balance update fails
    await supabase.from("transactions").delete().eq("id", transactionId);
    return { error: "Failed to update account balance. Transaction not created." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/account/${accountId}`);
  return { success: true };
}

export async function deleteTransactions(transactionIds: string[], accountId: string) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  if (!transactionIds || transactionIds.length === 0) {
    return { error: "No transactions selected." };
  }

  // Verify account belongs to user
  const { data: account } = await supabase
    .from("accounts")
    .select("id, balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) {
    return { error: "Account not found." };
  }

  // Get transactions to calculate balance adjustment
  const { data: transactions, error: fetchError } = await supabase
    .from("transactions")
    .select("id, type, amount")
    .in("id", transactionIds)
    .eq("account_id", accountId)
    .eq("user_id", userId);

  if (fetchError || !transactions || transactions.length === 0) {
    return { error: "Transactions not found or access denied." };
  }

  // Calculate balance adjustment (reverse the transactions)
  let balanceAdjustment = 0;
  transactions.forEach((t) => {
    balanceAdjustment += t.type === "INCOME" ? -t.amount : t.amount;
  });

  // Delete transactions
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds)
    .eq("account_id", accountId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: "Failed to delete transactions. Please try again." };
  }

  // Update account balance
  const newBalance = account.balance + balanceAdjustment;
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", accountId);

  if (updateError) {
    return { error: "Failed to update account balance." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/account/${accountId}`);
  return { success: true, deletedCount: transactions.length };
}



