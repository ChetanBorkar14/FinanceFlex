"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type Transaction = {
  id: string;
  description: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  status: string;
  isRecurring?: boolean;
  date: string;
};

interface TransactionTableProps {
  transactions: Transaction[];
}

type SortField = "date" | "amount" | null;
type SortDirection = "asc" | "desc";

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

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortField, setSortField] = React.useState<SortField>(null);
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("desc");
  const itemsPerPage = 25;

  // Sort transactions
  const sortedTransactions = React.useMemo(() => {
    if (!sortField) return transactions;

    return [...transactions].sort((a, b) => {
      let comparison = 0;

      if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [transactions, sortField, sortDirection]);

  // Paginate transactions
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Navigation functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  const SortIcon = ({ field }: { field: "date" | "amount" }) => {
    if (sortField !== field) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1 opacity-50"
        >
          <path d="M8 9l4-4 4 4" />
          <path d="M16 15l-4 4-4-4" />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1"
      >
        <path d="M8 9l4-4 4 4" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1"
      >
        <path d="M16 15l-4 4-4-4" />
      </svg>
    );
  };

  return (
    <div className="w-full">
      <style jsx>{`
        :global(.no-border-table tbody tr) {
          border-bottom: none !important;
        }
        :global(.no-border-table thead tr) {
          border-bottom: none !important;
        }
      `}</style>

      <div className="rounded-lg bg-card">
        <Table className="no-border-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center hover:text-foreground transition-colors font-semibold"
                >
                  Date
                  <SortIcon field="date" />
                </button>
              </TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center justify-end ml-auto hover:text-foreground transition-colors font-semibold"
                >
                  Amount
                  <SortIcon field="amount" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12"
                >
                  No transactions yet. Create one to see it here.
                </TableCell>
              </TableRow>
            )}
            {paginatedTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="capitalize">
                  {transaction.description}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {transaction.category}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.isRecurring
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {transaction.isRecurring ? "Recurring" : "One-time"}
                  </span>
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    transaction.type === "INCOME"
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-red-600 dark:text-red-500"
                  }`}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination Controls */}
      {sortedTransactions.length > 0 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(endIndex, sortedTransactions.length)}
            </span>{" "}
            of <span className="font-medium">{sortedTransactions.length}</span>{" "}
            transactions
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 px-3 py-1 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
