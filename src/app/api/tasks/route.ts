import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createTaskSchema, taskPriorityValues, taskStatusValues } from "@/lib/validation";

const SORT_FIELDS = ["dueDate", "priority", "createdAt"] as const;
const PRIORITY_RANK: Record<(typeof taskPriorityValues)[number], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const sort = searchParams.get("sort");

  const where: Record<string, unknown> = { userId: user.id };
  if (status && (taskStatusValues as readonly string[]).includes(status)) {
    where.status = status;
  }
  if (priority && (taskPriorityValues as readonly string[]).includes(priority)) {
    where.priority = priority;
  }

  const tasks = await prisma.task.findMany({ where });

  const sortField = (SORT_FIELDS as readonly string[]).includes(sort ?? "")
    ? (sort as (typeof SORT_FIELDS)[number])
    : "createdAt";

  const sorted = [...tasks].sort((a, b) => {
    if (sortField === "priority") {
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    }
    if (sortField === "dueDate") {
      const aTime = a.dueDate ? a.dueDate.getTime() : Infinity;
      const bTime = b.dueDate ? b.dueDate.getTime() : Infinity;
      return aTime - bTime;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return NextResponse.json({ tasks: sorted });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { title, description, status, priority, dueDate } = parsed.data;

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title,
      description: description ?? null,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
