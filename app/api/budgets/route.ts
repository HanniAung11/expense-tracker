import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";

// Helper to get period range based on budget period and dates
function getPeriodRange(period: string, startDate: Date, endDate?: Date | null) {
  const now = new Date();

  if (period === "monthly") {
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  }

  if (period === "weekly") {
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }

  if (period === "yearly") {
    return {
      start: startOfYear(now),
      end: endOfYear(now),
    };
  }

  // Fallback: custom range defined on budget
  return {
    start: startDate,
    end: endDate ?? endOfMonth(startDate),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // For each budget, calculate spent amount in its period
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const { start, end } = getPeriodRange(
          budget.period,
          budget.startDate,
          budget.endDate
        );

        const where: any = {
          userId: user.id,
          date: {
            gte: start,
            lte: end,
          },
        };

        if (budget.category) {
          where.category = budget.category;
        }

        const aggregate = await prisma.expense.aggregate({
          where,
          _sum: {
            amount: true,
          },
        });

        const spent = Number(aggregate._sum.amount || 0);
        const remaining = Math.max(budget.amount - spent, 0);
        const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 999) : 0;

        return {
          ...budget,
          spent,
          remaining,
          progress,
        };
      })
    );

    return NextResponse.json(budgetsWithProgress);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
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
      category,
      amount,
      period,
      startDate,
      endDate,
      alertThreshold,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!period || !["monthly", "weekly", "yearly"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        category: category || null,
        amount,
        period,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        alertThreshold: alertThreshold ?? null,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}


