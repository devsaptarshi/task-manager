"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuickAdd } from "@/components/quick-add";
import { TaskItem } from "@/components/task-item";
import { TaskFormDialog, datetimeLocalToIso, type TaskFormValues } from "@/components/task-form-dialog";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import type { QuickAddTask } from "@/lib/validation";

type StatusFilter = TaskStatus | "ALL";
type PriorityFilter = TaskPriority | "ALL";
type SortKey = "createdAt" | "dueDate" | "priority";

// Passed to <Select items={...}> so the trigger shows the friendly label
// immediately, instead of the raw value until the popup has opened once.
const STATUS_FILTER_ITEMS: Record<StatusFilter, string> = {
  ALL: "All statuses",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};
const PRIORITY_FILTER_ITEMS: Record<PriorityFilter, string> = {
  ALL: "All priorities",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
const SORT_ITEMS: Record<SortKey, string> = {
  createdAt: "Newest first",
  dueDate: "Due date",
  priority: "Priority",
};

async function parseJson(res: Response) {
  return res.json().catch(() => ({}));
}

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("createdAt");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickAddPreview, setQuickAddPreview] = useState<QuickAddTask | null>(null);

  const refetch = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
    params.set("sort", sort);

    const res = await fetch(`/api/tasks?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks as Task[]);
  }, [statusFilter, priorityFilter, sort]);

  useEffect(() => {
    // Re-fetch from the server whenever a filter/sort control changes — this
    // syncs with the server's dataset, not a value derivable from existing state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  function toApiPayload(values: TaskFormValues) {
    return {
      title: values.title.trim(),
      description: values.description.trim() || null,
      status: values.status,
      priority: values.priority,
      dueDate: datetimeLocalToIso(values.dueDate),
    };
  }

  async function handleCreate(values: TaskFormValues) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApiPayload(values)),
    });
    if (!res.ok) {
      const data = await parseJson(res);
      toast.error(data.error ?? "Could not create task");
      return;
    }
    toast.success("Task created");
    setQuickAddPreview(null);
    await refetch();
  }

  async function handleUpdate(id: string, values: TaskFormValues) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApiPayload(values)),
    });
    if (!res.ok) {
      const data = await parseJson(res);
      toast.error(data.error ?? "Could not update task");
      return;
    }
    toast.success("Task updated");
    await refetch();
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update status");
      await refetch();
      return;
    }
    await refetch();
  }

  async function handleDelete(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete task");
      setTasks(previous);
      return;
    }
    toast.success("Task deleted");
  }

  return (
    <div className="flex flex-col gap-6">
      <QuickAdd onParsed={setQuickAddPreview} />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={STATUS_FILTER_ITEMS}
          value={statusFilter}
          onValueChange={(v: StatusFilter | null) => v && setStatusFilter(v)}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="TODO">To do</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          items={PRIORITY_FILTER_ITEMS}
          value={priorityFilter}
          onValueChange={(v: PriorityFilter | null) => v && setPriorityFilter(v)}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>

        <Select
          items={SORT_ITEMS}
          value={sort}
          onValueChange={(v: SortKey | null) => v && setSort(v)}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Newest first</SelectItem>
            <SelectItem value="dueDate">Due date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="ml-auto"
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
        >
          New task
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No tasks yet — add one above.
          </p>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onStatusChange={(status) => handleStatusChange(task, status)}
            onEdit={() => {
              setEditingTask(task);
              setDialogOpen(true);
            }}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </div>

      {/* Manual create/edit dialog */}
      <TaskFormDialog
        open={dialogOpen && !quickAddPreview}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        title={editingTask ? "Edit task" : "New task"}
        submitLabel={editingTask ? "Save changes" : "Create task"}
        showStatus
        initialValues={editingTask ?? undefined}
        onSubmit={(values) =>
          editingTask ? handleUpdate(editingTask.id, values) : handleCreate(values)
        }
      />

      {/* AI quick-add confirm step — reuses the same dialog, prefilled from Claude's parse */}
      <TaskFormDialog
        open={Boolean(quickAddPreview)}
        onOpenChange={(open) => {
          if (!open) setQuickAddPreview(null);
        }}
        title="Confirm AI-parsed task"
        description="Review and adjust before saving."
        submitLabel="Add task"
        initialValues={quickAddPreview ?? undefined}
        onSubmit={handleCreate}
      />
    </div>
  );
}
