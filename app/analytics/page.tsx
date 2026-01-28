"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/features/charts/pie-chart";
import { ExpenseBarChart } from "@/components/features/charts/bar-chart";
import { ExpenseLineChart } from "@/components/features/charts/line-chart";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/api-client";

interface AnalyticsData {
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/expenses/stats?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await authenticatedFetch("/api/expenses?limit=10000");
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const result = await response.json();
      const expenses = result.expenses || [];

      // Create CSV content
      const headers = ["Date", "Category", "Amount", "Description", "Payment Method"];
      const rows = expenses.map((expense: any) => [
        new Date(expense.date).toLocaleDateString(),
        expense.category,
        expense.amount,
        expense.description || "",
        expense.paymentMethod,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: any[]) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `expenses-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export data");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <div>Error loading analytics data</div>;
  }

  const pieChartData = data.byCategory.map((item) => ({
    category: item.category,
    value: item.total,
  }));

  // Calculate percentage for each category
  const categoryBreakdown = data.byCategory
    .map((item) => ({
      category: item.category,
      total: item.total,
      percentage: (item.total / data.total) * 100,
      count: item.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <ProtectedLayout>
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Analytics & Reports</h1>
        <div className="flex gap-2">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </Select>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(data.total)}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {data.count} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data.average)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data.avgDailySpending)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ExpensePieChart data={pieChartData} />
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No category data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyExpenses.length > 0 ? (
              <ExpenseBarChart data={data.monthlyExpenses} />
            ) : (
              <p className="text-center text-gray-500 py-8">
                No monthly data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {data.dailySpending.length > 0 ? (
            <ExpenseLineChart data={data.dailySpending} />
          ) : (
            <p className="text-center text-gray-500 py-8">
              No daily spending data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.total)} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.count} transaction{item.count !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No category data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedLayout>
  );
}

