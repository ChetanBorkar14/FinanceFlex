import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Transaction = {
  id: string;
  description: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  status: string;
  date: string;
};

interface TransactionTableProps {
  accountId: string;
}

function formatAmount(value: number, type: Transaction["type"]) {
  const formatted = value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

  return type === "EXPENSE" ? `- ${formatted}` : `+ ${formatted}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function TransactionTable({
  accountId,
}: TransactionTableProps) {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, description, category, type, amount, status, date")
    .eq("account_id", accountId)
    .order("date", { ascending: false })
    .limit(25);

  if (error) {
    console.error("Error fetching transactions:", error.message);
  }

  const transactions: Transaction[] = data ?? [];

  return (
    <div className="w-full mt-8">
      <Table>
        <TableCaption>
          Showing your latest {transactions.length || "0"} transactions
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No transactions yet. Create one to see it here.
              </TableCell>
            </TableRow>
          )}
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell className="capitalize">{transaction.description}</TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {transaction.category}
              </TableCell>
              <TableCell className="uppercase text-xs font-semibold">
                {transaction.status}
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${
                  transaction.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
