import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const taskStatusValues = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const taskPriorityValues = ["LOW", "MEDIUM", "HIGH"] as const;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues).optional(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/** Input to the quick-add parser — capped well above any real task sentence, to bound AI cost/latency per call. */
export const quickAddInputSchema = z.object({
  text: z.string().trim().min(1, "Describe the task in a sentence").max(280, "Keep it to one sentence (280 characters)"),
});

/** Structured output schema for the Claude-powered "quick add" parser. */
export const quickAddTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  priority: z.enum(taskPriorityValues),
  dueDate: z
    .string()
    .nullable()
    .describe("ISO 8601 date-time string, or null if no date/time was mentioned"),
});

export type QuickAddTask = z.infer<typeof quickAddTaskSchema>;
