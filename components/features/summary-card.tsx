import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
}: SummaryCardProps) {
  const displayValue =
    typeof value === "number" ? formatCurrency(value) : value;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-fuchsia-500/10 hover:from-emerald-500/20 hover:via-sky-500/20 hover:to-fuchsia-500/20 transition-all duration-200 hover:translate-y-0.5 hover:shadow-emerald-500/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {title}
        </CardTitle>
        {Icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/5 text-emerald-600 dark:bg-slate-800 dark:text-emerald-300">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {displayValue}
        </div>
        {description && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

