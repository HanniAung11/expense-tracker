import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month"; // month, year, all

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period === "month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === "year") {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    } else {
      // all time
      startDate = new Date(0);
    }

    // Total expenses for period - filter by userId
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        amount: true,
      },
    });

    // Expenses by category - filter by userId
    const expensesByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Most expensive category
    const mostExpensiveCategory = expensesByCategory.reduce(
      (max, current) => {
        const currentTotal = Number(current._sum.amount || 0);
        const maxTotal = Number(max._sum.amount || 0);
        return currentTotal > maxTotal ? current : max;
      },
      expensesByCategory[0] || { category: "N/A", _sum: { amount: 0 } }
    );

    // Monthly expenses for last 6 months
    const monthlyExpenses = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthTotal = await prisma.expense.aggregate({
        where: {
          userId: user.id,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });
      monthlyExpenses.push({
        month: monthStart.toISOString().slice(0, 7),
        total: Number(monthTotal._sum.amount || 0),
      });
    }

    // Daily spending for current month - filter by userId
    const dailyExpenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      select: {
        date: true,
        amount: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by day
    const dailySpending: Record<string, number> = {};
    dailyExpenses.forEach((expense) => {
      const day = expense.date.toISOString().split("T")[0];
      dailySpending[day] = (dailySpending[day] || 0) + Number(expense.amount);
    });

    const dailySpendingArray = Object.entries(dailySpending).map(
      ([date, total]) => ({
        date,
        total,
      })
    );

    // Average daily spending
    const daysInPeriod =
      period === "month"
        ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
    const avgDailySpending =
      daysInPeriod > 0
        ? Number(totalExpenses._sum.amount || 0) / daysInPeriod
        : 0;

    return NextResponse.json({
      total: Number(totalExpenses._sum.amount || 0),
      count: totalExpenses._count.id || 0,
      average: Number(totalExpenses._avg.amount || 0),
      avgDailySpending,
      mostExpensiveCategory: {
        category: mostExpensiveCategory.category,
        amount: Number(mostExpensiveCategory._sum.amount || 0),
      },
      byCategory: expensesByCategory.map((item) => ({
        category: item.category,
        total: Number(item._sum.amount || 0),
        count: item._count.id,
      })),
      monthlyExpenses,
      dailySpending: dailySpendingArray,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

