import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAiProvider, parseQuickAddTask } from "@/lib/ai";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!getAiProvider()) {
    return NextResponse.json(
      { error: "AI quick add is not configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Describe the task in a sentence" }, { status: 400 });
  }

  try {
    const parsed = await parseQuickAddTask(text);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse that into a task" }, { status: 422 });
    }
    return NextResponse.json({ task: parsed });
  } catch (error) {
    console.error("quick-add parse failed", error);
    return NextResponse.json({ error: "AI quick add failed, try again" }, { status: 502 });
  }
}
