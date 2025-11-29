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
  Search,
  X,
  Trash2,
  Filter,
} from "lucide-react";
import { deleteTransactions } from "@/app/(main)/transaction/actions";
import { useRouter } from "next/navigation";

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
  accountId: string;
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
  accountId,
}: TransactionTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("desc");

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = React.useState<
    "ALL" | "INCOME" | "EXPENSE"
  >("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");

  const itemsPerPage = 25;

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    return filtered;
  }, [transactions, typeFilter, searchQuery, categoryFilter]);

  // Sort transactions
  const sortedTransactions = React.useMemo(() => {
    if (!sortField) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;

      if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredTransactions, sortField, sortDirection]);

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

  // Handle checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedTransactions.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} transaction(s)?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteTransactions(
        Array.from(selectedIds),
        accountId
      );
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result.error || "Failed to delete transactions");
      }
    } catch (error) {
      alert("An error occurred while deleting transactions");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setTypeFilter("ALL");
    setSearchQuery("");
    setCategoryFilter("ALL");
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

  const allSelected =
    paginatedTransactions.length > 0 &&
    paginatedTransactions.every((t) => selectedIds.has(t.id));
  const someSelected = paginatedTransactions.some((t) => selectedIds.has(t.id));

  const hasActiveFilters =
    typeFilter !== "ALL" || searchQuery || categoryFilter !== "ALL";

  return (
    <div className="w-full space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              •
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters - Hidden on mobile unless toggled */}
      <div className={`${showFilters ? "block" : "hidden"} md:block`}>
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as "ALL" | "INCOME" | "EXPENSE");
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() +
                      cat.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-muted-foreground">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search description..."
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
          <span className="text-sm font-medium text-destructive">
            {selectedIds.size} transaction(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg bg-card px-4 pt-2 pb-4 overflow-hidden shadow-md">
        <Table>
          <TableCaption>
            Showing {startIndex + 1}-
            {Math.min(endIndex, sortedTransactions.length)} of{" "}
            {sortedTransactions.length} transactions
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input)
                      input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
              </TableHead>
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
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  {transactions.length === 0
                    ? "No transactions yet. Create one to see it here."
                    : "No transactions match your filters."}
                </TableCell>
              </TableRow>
            )}
            {paginatedTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(transaction.id)}
                    onChange={(e) =>
                      handleSelectOne(transaction.id, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </TableCell>
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
                      transaction.type === "INCOME"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {transaction.type}
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedTransactions.length === 0 && (
          <div className="text-center text-muted-foreground py-12 rounded-lg bg-card">
            {transactions.length === 0
              ? "No transactions yet. Create one to see it here."
              : "No transactions match your filters."}
          </div>
        )}
        {paginatedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="rounded-lg bg-card p-4 shadow-sm border border-border"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedIds.has(transaction.id)}
                  onChange={(e) =>
                    handleSelectOne(transaction.id, e.target.checked)
                  }
                  className="h-4 w-4 rounded border-border accent-primary mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium capitalize truncate">
                    {transaction.description}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div
                className={`text-right font-semibold whitespace-nowrap ${
                  transaction.type === "INCOME"
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === "INCOME"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {transaction.type}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {transaction.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {sortedTransactions.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(endIndex, sortedTransactions.length)}
            </span>{" "}
            of <span className="font-medium">{sortedTransactions.length}</span>{" "}
            transactions
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {/* Desktop pagination with all buttons */}
              <div className="hidden sm:flex items-center gap-2">
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

              {/* Mobile pagination - simplified */}
              <div className="flex sm:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium border rounded-md">
                  {currentPage} / {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
