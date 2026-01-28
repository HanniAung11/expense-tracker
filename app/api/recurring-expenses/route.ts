import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
} from "date-fns";

function getNextDueDate(
  current: Date,
  frequency: string,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): Date {
  const base = startOfDay(current);

  switch (frequency) {
    case "daily":
      return addDays(base, 1);
    case "weekly":
      return addWeeks(base, 1);
    case "monthly": {
      const next = addMonths(base, 1);
      if (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 28) {
        next.setDate(dayOfMonth);
      }
      return next;
    }
    case "yearly":
      return addYears(base, 1);
    default:
      return addMonths(base, 1);
  }
}

// Optionally, generate due expenses when listing
async function materializeDueExpenses(userId: string) {
  const today = startOfDay(new Date());

  const dueRecurring = await prisma.recurringExpense.findMany({
    where: {
      userId,
      isActive: true,
      nextDueDate: {
        lte: today,
      },
    },
  });

  for (const rec of dueRecurring) {
    // Create one expense for the due date
    await prisma.expense.create({
      data: {
        userId,
        amount: rec.amount,
        category: rec.category,
        date: rec.nextDueDate,
        description: rec.description,
        paymentMethod: rec.paymentMethod,
        isRecurring: true,
        recurringId: rec.id,
      },
    });

    // Schedule next due date
    const nextDue = getNextDueDate(
      rec.nextDueDate,
      rec.frequency,
      rec.dayOfMonth,
      rec.dayOfWeek
    );

    await prisma.recurringExpense.update({
      where: { id: rec.id },
      data: {
        nextDueDate: nextDue,
      },
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate any due expenses first
    await materializeDueExpenses(user.id);

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        nextDueDate: "asc",
      },
    });

    return NextResponse.json(recurringExpenses);
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      category,
      description,
      paymentMethod,
      frequency,
      dayOfMonth,
      dayOfWeek,
      startDate,
      endDate,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!frequency || !["daily", "weekly", "monthly", "yearly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    const start = startOfDay(startDate ? new Date(startDate) : new Date());
    const firstDue = getNextDueDate(start, frequency, dayOfMonth, dayOfWeek);

    const rec = await prisma.recurringExpense.create({
      data: {
        userId: user.id,
        amount,
        category,
        description: description || null,
        paymentMethod,
        frequency,
        dayOfMonth: dayOfMonth ?? null,
        dayOfWeek: dayOfWeek ?? null,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
        nextDueDate: firstDue,
      },
    });

    return NextResponse.json(rec, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to create recurring expense" },
      { status: 500 }
    );
  }
}


