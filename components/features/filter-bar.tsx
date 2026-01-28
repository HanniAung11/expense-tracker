"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/types";
import { X } from "lucide-react";
import { startOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  search: string;
  sortBy: string;
  sortOrder: string;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
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

  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: searchInput };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setSearchInput("");
    const clearedFilters: FilterState = {
      category: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      search: "",
      sortBy: "date",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount ||
    searchInput;

  const setQuickDateFilter = (period: "today" | "week" | "month" | "year") => {
    const today = new Date();
    let startDate = "";
    let endDate = "";

    switch (period) {
      case "today":
        startDate = startOfToday().toISOString().split("T")[0];
        endDate = startOfToday().toISOString().split("T")[0];
        break;
      case "week":
        startDate = startOfWeek(today, { weekStartsOn: 1 }).toISOString().split("T")[0];
        endDate = endOfWeek(today, { weekStartsOn: 1 }).toISOString().split("T")[0];
        break;
      case "month":
        startDate = startOfMonth(today).toISOString().split("T")[0];
        endDate = endOfMonth(today).toISOString().split("T")[0];
        break;
      case "year":
        startDate = startOfYear(today).toISOString().split("T")[0];
        endDate = endOfYear(today).toISOString().split("T")[0];
        break;
    }

    const newFilters = { ...filters, startDate, endDate };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search by description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border-emerald-400/40 bg-white/70 shadow-sm shadow-emerald-500/10 backdrop-blur-md placeholder:text-slate-400 dark:border-emerald-400/40 dark:bg-slate-900/60"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick Date Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickDateFilter("today")}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickDateFilter("week")}
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickDateFilter("month")}
        >
          This Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickDateFilter("year")}
        >
          This Year
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 shadow-lg shadow-emerald-500/15 backdrop-blur-xl dark:border-emerald-500/35 dark:bg-slate-900/70 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Min Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Max Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Sort By</label>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Order</label>
            <Select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

