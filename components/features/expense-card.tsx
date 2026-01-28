import { type Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-[1px] hover:shadow-emerald-500/25">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={expense.category} />
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {formatCurrency(Number(expense.amount))}
              </span>
            </div>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
              {formatDate(expense.date)}
            </p>
            {expense.description && (
              <p className="mb-1 text-sm text-slate-700 dark:text-slate-200">
                {expense.description}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {expense.paymentMethod}
            </p>
          </div>
          <div className="ml-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(expense)}
              aria-label="Edit expense"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(expense)}
              aria-label="Delete expense"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

