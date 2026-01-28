"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { ExpenseForm } from "@/components/features/expense-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { authenticatedFetch } from "@/lib/api-client";
import { type ExpenseFormData } from "@/lib/validations";
import { type Expense } from "@/types";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      const response = await authenticatedFetch(`/api/expenses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setExpense(data);
      } else {
        alert("Expense not found");
        router.push("/expenses");
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
      alert("Failed to load expense");
      router.push("/expenses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(`/api/expenses/${id}`, {
        method: "PUT",
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
        alert(error.error || "Failed to update expense");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!expense) {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            expense={expense}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/expenses")}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
    </ProtectedLayout>
  );
}

