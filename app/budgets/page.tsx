"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading";
import { authenticatedFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

type BudgetWithProgress = {
  id: string;
  userId: string;
  category: string | null;
  amount: number;
  period: string;
  startDate: string;
  endDate: string | null;
  alertThreshold: number | null;
  createdAt: string;
  updatedAt: string;
  spent: number;
  remaining: number;
  progress: number;
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    period: "monthly",
    alertThreshold: "80",
  });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch("/api/budgets");
      if (!response.ok) {
        if (response.status === 401) return;
        console.error("Failed to fetch budgets");
        return;
      }
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await authenticatedFetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: form.category || null,
          amount: parseFloat(form.amount),
          period: form.period,
          alertThreshold: form.alertThreshold
            ? parseFloat(form.alertThreshold)
            : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.error || "Failed to create budget");
        return;
      }

      setForm({
        category: "",
        amount: "",
        period: "monthly",
        alertThreshold: "80",
      });
      await fetchBudgets();
    } catch (error) {
      console.error("Error creating budget:", error);
      alert("Failed to create budget");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (budget: BudgetWithProgress) => {
    if (!confirm("Delete this budget? This cannot be undone.")) return;
    try {
      const response = await authenticatedFetch(`/api/budgets/${budget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        alert("Failed to delete budget");
        return;
      }
      setBudgets((prev) => prev.filter((b) => b.id !== budget.id));
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Failed to delete budget");
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
        </div>

        {/* Create budget form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-sky-500 to-fuchsia-500 text-white shadow-md shadow-emerald-500/40">
                <Plus className="h-4 w-4" />
              </span>
              Create a new budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Category (optional)
                </label>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="">Overall (all categories)</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Amount *
                </label>
                <Input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Period *
                </label>
                <Select
                  name="period"
                  value={form.period}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Alert at % (optional)
                </label>
                <Input
                  name="alertThreshold"
                  type="number"
                  min="0"
                  max="100"
                  value={form.alertThreshold}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Add Budget"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Budget list */}
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-600">
              You haven&apos;t created any budgets yet. Add a monthly or weekly
              budget to track how close you are to your limits.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const overBudget = budget.spent > budget.amount;
              const nearAlert =
                budget.alertThreshold != null &&
                budget.progress >= budget.alertThreshold &&
                !overBudget;

              return (
                <Card
                  key={budget.id}
                  className="relative overflow-hidden border border-emerald-500/10 bg-white/80 shadow-sm shadow-emerald-500/10 backdrop-blur"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {budget.category ? budget.category : "Overall budget"}
                        </CardTitle>
                        <p className="mt-1 text-xs text-slate-600">
                          {budget.period === "monthly" && "This month"}
                          {budget.period === "weekly" && "This week"}
                          {budget.period === "yearly" && "This year"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(budget)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-baseline justify-between text-sm">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Spent
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(budget.spent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Budget
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(budget.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          {budget.progress.toFixed(0)}% used
                        </span>
                        <span className="text-slate-500">
                          {formatCurrency(budget.remaining)} remaining
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            overBudget
                              ? "bg-red-500"
                              : nearAlert
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(budget.progress, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Alerts */}
                    {(overBudget || nearAlert) && (
                      <div className="mt-1 flex items-start gap-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p className="leading-snug">
                          {overBudget
                            ? "You have exceeded this budget. Review your recent expenses to see where you can cut back."
                            : "You are approaching your alert threshold for this budget. Keep an eye on your spending."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

