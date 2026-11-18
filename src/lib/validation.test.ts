import { describe, expect, it } from "vitest";
import {
  createTaskSchema,
  loginSchema,
  quickAddTaskSchema,
  signupSchema,
} from "@/lib/validation";

describe("signupSchema", () => {
  it("accepts a valid email and password", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("lowercases and trims the email", () => {
    const result = signupSchema.safeParse({ email: "  A@B.COM  ", password: "password123" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("a@b.com");
  });

  it("rejects a short password", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("createTaskSchema", () => {
  it("accepts a minimal task with just a title", () => {
    const result = createTaskSchema.safeParse({ title: "Buy milk" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = createTaskSchema.safeParse({ title: "Buy milk", status: "DONE_ZO" });
    expect(result.success).toBe(false);
  });

  it("treats an empty-string dueDate as null", () => {
    const result = createTaskSchema.safeParse({ title: "Buy milk", dueDate: "" });
    expect(result.success).toBe(true);
    expect(result.data?.dueDate).toBeNull();
  });

  it("requires a timezone offset on dueDate", () => {
    const result = createTaskSchema.safeParse({
      title: "Buy milk",
      dueDate: "2026-01-01T10:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an ISO dueDate with an offset", () => {
    const result = createTaskSchema.safeParse({
      title: "Buy milk",
      dueDate: "2026-01-01T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });
});

describe("quickAddTaskSchema", () => {
  it("accepts the shape returned by the AI parser", () => {
    const result = quickAddTaskSchema.safeParse({
      title: "Call the dentist",
      description: null,
      priority: "HIGH",
      dueDate: "2026-01-02T15:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing priority", () => {
    const result = quickAddTaskSchema.safeParse({
      title: "Call the dentist",
      description: null,
      dueDate: null,
    });
    expect(result.success).toBe(false);
  });
});
