import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAiProvider, parseQuickAddTask } from "@/lib/ai";
import { quickAddInputSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Scoped to the user, not the IP — this is a cost control (every call is a
  // real, billed model request), so it has to hold regardless of network.
  const { ok, retryAfterSeconds } = rateLimit(`quick-add:${user.id}`, 20, 60 * 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "You've hit the quick-add limit for now, try again later" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  if (!getAiProvider()) {
    return NextResponse.json(
      { error: "AI quick add is not configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = quickAddInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const task = await parseQuickAddTask(parsed.data.text);
    if (!task) {
      return NextResponse.json({ error: "Could not parse that into a task" }, { status: 422 });
    }
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "AI quick add timed out, try again" }, { status: 504 });
    }
    console.error("quick-add parse failed", error);
    return NextResponse.json({ error: "AI quick add failed, try again" }, { status: 502 });
  }
}
