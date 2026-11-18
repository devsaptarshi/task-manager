import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskBoard } from "@/components/task-board";
import type { Task } from "@/lib/types";

export default async function TasksPage() {
  const user = await getSessionUser();
  const tasks = await prisma.task.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return <TaskBoard initialTasks={JSON.parse(JSON.stringify(tasks)) as Task[]} />;
}
