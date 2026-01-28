import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const rec = await prisma.recurringExpense.update({
      where: { id },
      data: {
        amount: body.amount ?? existing.amount,
        category: body.category ?? existing.category,
        description: body.description ?? existing.description,
        paymentMethod: body.paymentMethod ?? existing.paymentMethod,
        frequency: body.frequency ?? existing.frequency,
        dayOfMonth:
          body.dayOfMonth !== undefined ? body.dayOfMonth : existing.dayOfMonth,
        dayOfWeek:
          body.dayOfWeek !== undefined ? body.dayOfWeek : existing.dayOfWeek,
        startDate: body.startDate
          ? new Date(body.startDate)
          : existing.startDate,
        endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
        isActive:
          body.isActive !== undefined ? body.isActive : existing.isActive,
      },
    });

    return NextResponse.json(rec);
  } catch (error) {
    console.error("Error updating recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to update recurring expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 }
      );
    }

    await prisma.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring expense" },
      { status: 500 }
    );
  }
}


