"use server";

import { randomUUID } from "crypto";
import { subDays } from "date-fns";

import { createServiceSupabaseClient } from "@/lib/supabase/service-client";

const SEED_USER_ID = "b4f6de8f-6862-468a-83e7-80090c2d9eef";
const SEED_ACCOUNT_ID = "c46cee7b-6f19-4f43-9be0-1c6739044b22";

// Categories with their typical amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type: keyof typeof CATEGORIES) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

async function ensureSeedAccount(supabase: ReturnType<typeof createServiceSupabaseClient>) {
  const now = new Date().toISOString();

  const { data: account, error: fetchAccountError } = await supabase
    .from("accounts")
    .select("id, user_id")
    .eq("id", SEED_ACCOUNT_ID)
    .maybeSingle();

  if (fetchAccountError) {
    throw new Error(fetchAccountError.message);
  }

  if (account) {
    return account;
  }

  const { data: user, error: fetchUserError } = await supabase
    .from("users")
    .select("user_id")
    .eq("user_id", SEED_USER_ID)
    .maybeSingle();

  if (fetchUserError) {
    throw new Error(fetchUserError.message);
  }

  if (!user) {
    const { error: insertUserError } = await supabase.from("users").insert({
      user_id: SEED_USER_ID,
      name: "Demo User",
      email: "demo@financeflex.com",
      created_at: now,
      updated_at: now,
    });

    if (insertUserError) {
      throw new Error(insertUserError.message);
    }
  }

  const { data: newAccount, error: insertAccountError } = await supabase
    .from("accounts")
    .upsert(
      {
        id: SEED_ACCOUNT_ID,
        user_id: SEED_USER_ID,
        name: "Demo Seed Account",
        type: "CHECKING",
        balance: 0,
        is_default: true,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "id" }
    )
    .select("id, user_id")
    .single();

  if (insertAccountError) {
    throw new Error(insertAccountError.message);
  }

  return newAccount;
}

export async function seedTransactions() {
  try {
    const supabase = createServiceSupabaseClient();
    const account = await ensureSeedAccount(supabase);

    // Generate 90 days of transactions
    const transactions: {
      id: string;
      type: "INCOME" | "EXPENSE";
      kind: "INCOME" | "EXPENSE";
      amount: number;
      description: string;
      category: string;
      date: string;
      status: string;
      user_id: string;
      account_id: string;
      created_at: string;
      updated_at: string;
    }[] = [];
    let totalBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);
        const description = `${
          type === "INCOME" ? "Received" : "Paid for"
        } ${category}`;

        transactions.push({
          id: randomUUID(),
          type,
          kind: type,
          amount,
          description,
          date: date.toISOString(),
          category,
          status: "COMPLETED",
          user_id: account.user_id,
          account_id: account.id,
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
        });

        totalBalance += type === "INCOME" ? amount : -amount;
      }
    }

    // Clear existing transactions for the account
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("account_id", account.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new transactions
    const chunkSize = 500;
    for (let i = 0; i < transactions.length; i += chunkSize) {
      const chunk = transactions.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(chunk);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    // Update account balance
    const { error: accountError } = await supabase
      .from("accounts")
      .update({ balance: totalBalance })
      .eq("id", account.id);

    if (accountError) {
      throw accountError;
    }

    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null
            ? JSON.stringify(error)
            : "Unknown error while seeding",
    };
  }
}
