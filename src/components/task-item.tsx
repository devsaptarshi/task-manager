"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

const STATUS_ITEMS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const PRIORITY_VARIANT: Record<TaskPriority, string> = {
  HIGH: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function formatDueDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dueLabel = formatDueDate(task.dueDate);
  const overdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();

  return (
    <div
      data-testid="task-item"
      data-task-title={task.title}
      className="flex items-start justify-between gap-4 rounded-lg border p-4"
    >
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={task.status === "DONE" ? "line-through text-muted-foreground" : "font-medium"}>
            {task.title}
          </span>
          <Badge className={PRIORITY_VARIANT[task.priority]} variant="secondary">
            {task.priority}
          </Badge>
          {dueLabel && (
            <span className={`text-xs ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              Due {dueLabel}
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Select
          items={STATUS_ITEMS}
          value={task.status}
          onValueChange={(value: TaskStatus | null) => value && onStatusChange(value)}
        >
          <SelectTrigger size="sm" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">To do</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
          Delete
        </Button>
      </div>
    </div>
  );
}
