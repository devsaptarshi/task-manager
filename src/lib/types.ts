export { TaskPriority, TaskStatus } from "@/generated/prisma/enums";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

/** Task shape as it travels over JSON (dates are ISO strings, not Date objects). */
export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
