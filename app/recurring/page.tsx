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
import { CATEGORIES, PAYMENT_METHODS } from "@/types";
import { CalendarClock, PauseCircle, PlayCircle, Trash2 } from "lucide-react";

type Recurring = {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string | null;
  paymentMethod: string;
  frequency: string;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  nextDueDate: string;
  createdAt: string;
  updatedAt: string;
};

export default function RecurringPage() {
  const [items, setItems] = useState<Recurring[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    paymentMethod: PAYMENT_METHODS[0],
    frequency: "monthly",
    dayOfMonth: "",
    dayOfWeek: "1",
  });

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/recurring-expenses");
      if (!res.ok) {
        if (res.status === 401) return;
        console.error("Failed to fetch recurring expenses");
        return;
      }
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
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
      const res = await authenticatedFetch("/api/recurring-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description || null,
          paymentMethod: form.paymentMethod,
          frequency: form.frequency,
          dayOfMonth: form.frequency === "monthly" ? Number(form.dayOfMonth) || null : null,
          dayOfWeek: form.frequency === "weekly" ? Number(form.dayOfWeek) || null : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(error.error || "Failed to create recurring expense");
        return;
      }

      setForm({
        amount: "",
        category: "",
        description: "",
        paymentMethod: PAYMENT_METHODS[0],
        frequency: "monthly",
        dayOfMonth: "",
        dayOfWeek: "1",
      });
      await fetchRecurring();
    } catch (error) {
      console.error("Error creating recurring expense:", error);
      alert("Failed to create recurring expense");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (item: Recurring) => {
    try {
      const res = await authenticatedFetch(`/api/recurring-expenses/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) {
        alert("Failed to update recurring expense");
        return;
      }
      await fetchRecurring();
    } catch (error) {
      console.error("Error updating recurring expense:", error);
      alert("Failed to update recurring expense");
    }
  };

  const handleDelete = async (item: Recurring) => {
    if (!confirm("Delete this recurring expense schedule?")) return;
    try {
      const res = await authenticatedFetch(`/api/recurring-expenses/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete recurring expense");
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
      alert("Failed to delete recurring expense");
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
          <h1 className="text-3xl font-bold text-slate-900">Recurring Expenses</h1>
        </div>

        {/* Create form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-sky-500 to-fuchsia-500 text-white shadow-md shadow-emerald-500/40">
                <CalendarClock className="h-4 w-4" />
              </span>
              Schedule a recurring expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="grid gap-4 md:grid-cols-[1.2fr_1fr_1.2fr_1fr_1fr_auto]"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Category *
                </label>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full"
                >
                  <option value="">Select category</option>
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
                  Payment Method *
                </label>
                <Select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Frequency *
                </label>
                <Select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>
              {form.frequency === "monthly" ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Day of month
                  </label>
                  <Input
                    name="dayOfMonth"
                    type="number"
                    min="1"
                    max="28"
                    value={form.dayOfMonth}
                    onChange={handleChange}
                  />
                </div>
              ) : form.frequency === "weekly" ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Day of week
                  </label>
                  <Select
                    name="dayOfWeek"
                    value={form.dayOfWeek}
                    onChange={handleChange}
                    className="w-full"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </Select>
                </div>
              ) : (
                <div />
              )}
              <div className="flex items-end">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Add"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-600">
              You don&apos;t have any recurring expenses yet. Create one above
              to automatically generate expenses on a schedule.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const nextDate = new Date(item.nextDueDate);
              const isInactive = !item.isActive;

              return (
                <Card
                  key={item.id}
                  className={`relative overflow-hidden border bg-white/80 shadow-sm backdrop-blur ${
                    isInactive ? "border-slate-200" : "border-emerald-500/20"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {item.category}
                        </CardTitle>
                        <p className="mt-1 text-xs text-slate-600">
                          {item.frequency.charAt(0).toUpperCase() +
                            item.frequency.slice(1)}{" "}
                          • {item.isActive ? "Active" : "Paused"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleActive(item)}
                        >
                          {item.isActive ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-sm">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Amount
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Next due
                        </p>
                        <p className="text-sm text-slate-800">
                          {nextDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-600">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Payment method: {item.paymentMethod}
                    </p>
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


