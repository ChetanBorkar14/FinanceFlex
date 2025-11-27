"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { randomUUID } from "crypto";

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

export async function createAccount(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  if (!formData) {
    return { error: "Invalid form data." };
  }

  const nameValue = formData.get("name");
  const typeValue = formData.get("type");
  const balanceValue = formData.get("balance");
  
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const type = typeof typeValue === "string" ? typeValue.trim() : "";
  const balance = typeof balanceValue === "string" ? balanceValue.trim() : "";
  const isDefault = formData.get("is_default") === "true";

  if (!name || !type || balance === undefined) {
    return { error: "Name, type, and balance are required." };
  }

  const balanceNum = parseFloat(balance);
  if (isNaN(balanceNum)) {
    return { error: "Balance must be a valid number." };
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await supabase
      .from("accounts")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { error } = await supabase.from("accounts").insert({
    id: randomUUID(),
    user_id: userId,
    name,
    type,
    balance: balanceNum,
    is_default: isDefault,
  });

  if (error) {
    return { error: "Failed to create account. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAccount(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  if (!formData) {
    return { error: "Invalid form data." };
  }

  const accountIdValue = formData.get("id");
  const nameValue = formData.get("name");
  const typeValue = formData.get("type");
  const balanceValue = formData.get("balance");
  
  const accountId = typeof accountIdValue === "string" ? accountIdValue : "";
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const type = typeof typeValue === "string" ? typeValue.trim() : "";
  const balance = typeof balanceValue === "string" ? balanceValue.trim() : "";
  const isDefault = formData.get("is_default") === "true";

  if (!accountId || !name || !type || balance === undefined) {
    return { error: "All fields are required." };
  }

  const balanceNum = parseFloat(balance);
  if (isNaN(balanceNum)) {
    return { error: "Balance must be a valid number." };
  }

  // Verify account belongs to user
  const { data: account } = await supabase
    .from("accounts")
    .select("user_id")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) {
    return { error: "Account not found." };
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await supabase
      .from("accounts")
      .update({ is_default: false })
      .eq("user_id", userId)
      .neq("id", accountId);
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      name,
      type,
      balance: balanceNum,
      is_default: isDefault,
    })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Failed to update account. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAccount(accountId: string) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  // Verify account belongs to user
  const { data: account } = await supabase
    .from("accounts")
    .select("user_id")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) {
    return { error: "Account not found." };
  }

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Failed to delete account. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleDefaultAccount(accountId: string) {
  const userId = await getAuthenticatedUserId();
  const supabase = createServiceSupabaseClient();

  // Verify account belongs to user
  const { data: account } = await supabase
    .from("accounts")
    .select("user_id, is_default")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) {
    return { error: "Account not found." };
  }

  const newDefaultValue = !account.is_default;

  // If setting as default, unset other defaults
  if (newDefaultValue) {
    await supabase
      .from("accounts")
      .update({ is_default: false })
      .eq("user_id", userId)
      .neq("id", accountId);
  }

  // Update this account's default status
  const { error } = await supabase
    .from("accounts")
    .update({ is_default: newDefaultValue })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Failed to update default status. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true, is_default: newDefaultValue };
}

