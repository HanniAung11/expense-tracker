"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { ExpenseCard } from "@/components/features/expense-card";
import { FilterBar, type FilterState } from "@/components/features/filter-bar";
import { Pagination } from "@/components/features/pagination";
import { ConfirmationModal } from "@/components/features/confirmation-modal";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { authenticatedFetch } from "@/lib/api-client";
import { type Expense } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    search: "",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    expense: Expense | null;
  }>({ isOpen: false, expense: null });
  const router = useRouter();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }
      if (filters.minAmount) {
        params.append("minAmount", filters.minAmount);
      }
      if (filters.maxAmount) {
        params.append("maxAmount", filters.maxAmount);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await authenticatedFetch(`/api/expenses?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching expenses:", errorData);
        setExpenses([]);
        setTotalPages(1);
        return;
      }
      
      const data = await response.json();
      setExpenses(data.expenses || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDelete = (expense: Expense) => {
    setDeleteModal({ isOpen: true, expense });
  };

  const confirmDelete = async () => {
    if (!deleteModal.expense) return;

    try {
      const response = await authenticatedFetch(`/api/expenses/${deleteModal.expense.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExpenses();
        setDeleteModal({ isOpen: false, expense: null });
      } else {
        alert("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  const handleEdit = (expense: Expense) => {
    router.push(`/expenses/${expense.id}/edit`);
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">All Expenses</h1>
        <Link href="/expenses/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      {loading ? (
        <LoadingSpinner />
      ) : expenses.length > 0 ? (
        <>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            No expenses found. Try adjusting your filters or add a new expense.
          </p>
          <Link href="/expenses/add">
            <Button className="mt-4">Add Expense</Button>
          </Link>
        </Card>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, expense: null })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
    </ProtectedLayout>
  );
}

