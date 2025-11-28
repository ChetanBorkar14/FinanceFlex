import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import TransactionTable from "@/app/(main)/account/_components/transaction-table";
interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) redirect("/login");

  const session = await verifySessionToken(token);
  if (!session?.sub) redirect("/login");

  return session.sub;
}

export default async function AccountPage({ params }: PageProps) {
  const accountId = (await params).id;
  const userId = await getAuthenticatedUserId();

  const supabase = createServiceSupabaseClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) redirect("/not-found");

  return (
    <div className="space-y-8">
      {/* Account Card */}
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6 bg-background text-foreground m-8 border-2 border-gray-200 dark:border-gray-950 rounded-xl shadow-lg">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Account Name
          </p>
          <p className="capitalize tracking-[0.05em] text-foreground text-3xl font-semibold sm:text-4xl mb-4">
            {account.name}
          </p>

          <p className="text-sm">
            <span className="font-semibold text-muted-foreground">Type:</span>{" "}
            {account.type}
          </p>
        </div>

        <div className="flex-1 text-left sm:text-right">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Balance
          </p>
          <p className="text-3xl font-bold text-primary mb-2">
            ₹{account.balance.toFixed(2)}
          </p>

          <p className="text-sm font-bold text-foreground">
            Default Account:{" "}
            <span
              className={`${
                account.is_default ? "text-green-500" : "text-red-500"
              } font-semibold`}
            >
              {account.is_default ? "Yes" : "No"}
            </span>
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="m-8 p-8 bg-background border-2 border-gray-200 dark:border-gray-950 rounded-xl shadow-md overflow-hidden">
        <TransactionTable accountId={accountId} />
      </div>
    </div>
  );
}
