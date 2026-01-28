"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { ExpenseForm } from "@/components/features/expense-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { type ExpenseFormData } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/api-client";
import { Sparkles, TrendingUp, PieChart } from "lucide-react";

interface StatsPreview {
  total: number;
  count: number;
  average: number;
  mostExpensiveCategory: {
    category: string;
    amount: number;
  };
}

export default function AddExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsPreview | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authenticatedFetch("/api/expenses/stats?period=month");
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          count: data.count ?? 0,
          average: data.average ?? 0,
          mostExpensiveCategory:
            data.mostExpensiveCategory ?? { category: "N/A", amount: 0 },
        });
      } catch {
        // optional preview, ignore errors
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          date: data.date.toISOString(),
        }),
      });

      if (response.ok) {
        router.push("/expenses");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create expense");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to create expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)]">
      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-sky-500 to-fuchsia-500 text-white shadow-md shadow-emerald-500/40">
              <Sparkles className="h-4 w-4" />
            </span>
            Add New Expense
          </CardTitle>
          <CardDescription className="mt-2">
            Capture your spending with detailed categories and payment methods. Your dashboard and
            analytics update instantly with every new transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Card className="order-1 bg-gradient-to-br from-emerald-500/15 via-sky-500/15 to-fuchsia-500/15 lg:order-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-50">
            Monthly Snapshot
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-slate-900/60 dark:text-emerald-300">
              <TrendingUp className="h-3 w-3" />
              Live insights
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {statsLoading ? (
            <p className="text-slate-700 dark:text-slate-200">
              Crunching your recent expenses...
            </p>
          ) : stats && stats.count > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-3 shadow-sm shadow-emerald-500/10 backdrop-blur dark:bg-slate-950/60">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Spent this month
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {formatCurrency(stats.total)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-3 shadow-sm shadow-emerald-500/10 backdrop-blur dark:bg-slate-950/60">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Avg per transaction
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {formatCurrency(stats.average)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/5 p-3 shadow-sm shadow-emerald-500/15 backdrop-blur dark:bg-slate-950/40">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <PieChart className="h-3 w-3" />
                  Top category this month
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {stats.mostExpensiveCategory.category}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {formatCurrency(stats.mostExpensiveCategory.amount)} spent so far
                </p>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200">
                Tip: Logging expenses consistently helps you spot patterns, control impulse
                spending, and stay aligned with your monthly budget.
              </p>
            </>
          ) : (
            <p className="text-slate-800 dark:text-slate-100">
              You don&apos;t have any expenses this month yet. Start by adding your first one and
              watch your dashboard and analytics come to life in real time.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedLayout>
  );
}

