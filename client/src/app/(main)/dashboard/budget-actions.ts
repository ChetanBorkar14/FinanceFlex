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

export async function createBudget(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  if (!formData) {
    return { error: "Invalid form data." };
  }

  const amountValue = formData.get("amount");

  const amount = typeof amountValue === "string" ? amountValue.trim() : "";

  if (!amount) {
    return { error: "Budget amount is required." };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { error: "Budget amount must be a valid positive number." };
  }

  // Check if user already has a budget
  const { data: existingBudget } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingBudget) {
    return {
      error: "You already have a budget. Please update the existing one.",
    };
  }

  // Create budget
  const budgetId = randomUUID();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("budgets").insert({
    id: budgetId,
    user_id: userId,
    amount: amountNum,
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    return { error: "Failed to create budget. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBudget(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  if (!formData) {
    return { error: "Invalid form data." };
  }

  const budgetIdValue = formData.get("id");
  const amountValue = formData.get("amount");

  const budgetId =
    typeof budgetIdValue === "string" ? budgetIdValue.trim() : "";
  const amount = typeof amountValue === "string" ? amountValue.trim() : "";

  if (!budgetId || !amount) {
    return { error: "Budget ID and amount are required." };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { error: "Budget amount must be a valid positive number." };
  }

  // Verify budget belongs to user
  const { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", budgetId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!budget) {
    return { error: "Budget not found." };
  }

  // Update budget
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("budgets")
    .update({
      amount: amountNum,
      updated_at: now,
    })
    .eq("id", budgetId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: "Failed to update budget. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudget(budgetId: string) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  // Verify budget belongs to user
  const { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", budgetId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!budget) {
    return { error: "Budget not found." };
  }

  const { error: deleteError } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: "Failed to delete budget. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

