"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { SummaryCard } from "@/components/features/summary-card";
import { ExpensePieChart } from "@/components/features/charts/pie-chart";
import { ExpenseBarChart } from "@/components/features/charts/bar-chart";
import { ExpenseLineChart } from "@/components/features/charts/line-chart";
import { ExpenseCard } from "@/components/features/expense-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/api-client";
import { type Expense } from "@/types";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Stats {
  total: number;
  count: number;
  average: number;
  avgDailySpending: number;
  mostExpensiveCategory: {
    category: string;
    amount: number;
  };
  byCategory: Array<{
    category: string;
    total: number;
    count: number;
  }>;
  monthlyExpenses: Array<{
    month: string;
    total: number;
  }>;
  dailySpending: Array<{
    date: string;
    total: number;
  }>;
}

type DashboardBudget = {
  id: string;
  category: string | null;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  period: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<DashboardBudget[]>([]);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to be ready before fetching data
    if (authLoading) return;
    if (!user) {
      // ProtectedLayout will handle redirect; just stop loading spinner
      setLoading(false);
      return;
    }

    fetchStats();
    fetchRecentExpenses();
    fetchBudgets();
  }, [authLoading, user]);

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch("/api/expenses/stats?period=month");
      if (!response.ok) {
        // If unauthorized (e.g., user not logged in yet), silently skip
        if (response.status === 401) {
          return;
        }
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch stats:", errorData);
        throw new Error(errorData.error || "Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      const response = await authenticatedFetch("/api/expenses?limit=10&sortBy=date&sortOrder=desc");
      if (!response.ok) {
        // If unauthorized (e.g., user not logged in yet), silently skip
        if (response.status === 401) {
          return;
        }
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch expenses:", errorData);
        throw new Error(errorData.error || "Failed to fetch expenses");
      }
      const data = await response.json();
      setRecentExpenses(data.expenses || []);
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
    }
  };

  const fetchBudgets = async () => {
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
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await authenticatedFetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchRecentExpenses();
        fetchStats();
      } else {
        alert("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  const handleEdit = (expense: Expense) => {
    window.location.href = `/expenses/${expense.id}/edit`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    // While auth is loading, keep the spinner
    if (authLoading || loading) {
      return <LoadingSpinner />;
    }
    // Render ProtectedLayout so it can redirect unauthenticated users to /login
    return (
      <ProtectedLayout>
        <div />
      </ProtectedLayout>
    );
  }

  const pieChartData = stats.byCategory
    .slice(0, 5)
    .map((item) => ({
      category: item.category,
      value: item.total,
    }));

  const currentYear = new Date().getFullYear();
  const yearStats = stats.monthlyExpenses.reduce(
    (sum, month) => sum + month.total,
    0
  );

  return (
    <ProtectedLayout>
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <Link href="/expenses/add">
          <Button>Add Expense</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="This Month"
          value={stats.total}
          icon={DollarSign}
          description={`${stats.count} transactions`}
        />
        <SummaryCard
          title="This Year"
          value={yearStats}
          icon={Calendar}
        />
        <SummaryCard
          title="Avg Daily Spending"
          value={stats.avgDailySpending}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Top Category"
          value={stats.mostExpensiveCategory.amount}
          icon={CreditCard}
          description={stats.mostExpensiveCategory.category}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ExpensePieChart data={pieChartData} />
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No expenses this month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyExpenses.length > 0 ? (
              <ExpenseBarChart data={stats.monthlyExpenses} />
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No monthly data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budgets overview */}
      {budgets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Budget overview
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {budgets.slice(0, 3).map((b) => {
              const over = b.spent > b.amount;
              const label = b.category ?? "Overall";
              const badge =
                b.period === "monthly"
                  ? "This month"
                  : b.period === "weekly"
                  ? "This week"
                  : b.period === "yearly"
                  ? "This year"
                  : b.period;

              return (
                <Card
                  key={b.id}
                  className="border border-emerald-500/10 bg-white/80 shadow-sm shadow-emerald-500/10 backdrop-blur"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        {label}
                      </CardTitle>
                      <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                        {badge}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 text-xs">
                    <div className="flex items-baseline justify-between text-sm">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Used
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {formatCurrency(b.spent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Budget
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {formatCurrency(b.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">
                        {b.progress.toFixed(0)}% used
                      </span>
                      <span className="text-slate-500">
                        {formatCurrency(b.remaining)} left
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          over
                            ? "bg-red-500"
                            : b.progress >= 80
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(b.progress, 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Spending Trend (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dailySpending.length > 0 ? (
            <ExpenseLineChart data={stats.dailySpending} />
          ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No daily spending data available
              </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/expenses">
            <Button variant="outline" size="sm">
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No expenses yet. Add your first expense to get started!</p>
              <Link href="/expenses/add">
                <Button className="mt-4">Add Expense</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedLayout>
  );
}
