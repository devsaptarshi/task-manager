import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getSessionUser } from "@/lib/auth";
import { quickAddTaskSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI quick add is not configured (missing ANTHROPIC_API_KEY)" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Describe the task in a sentence" }, { status: 400 });
  }

  const client = new Anthropic();
  const now = new Date().toISOString();

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system: `You turn one sentence describing a task into a structured task. Today's date/time (ISO 8601, for resolving relative dates like "tomorrow" or "next Friday") is ${now}. If no priority is stated or implied, use MEDIUM. If no date/time is mentioned, dueDate must be null.`,
      messages: [{ role: "user", content: text }],
      output_config: {
        format: zodOutputFormat(quickAddTaskSchema),
      },
    });

    if (!response.parsed_output) {
      return NextResponse.json({ error: "Could not parse that into a task" }, { status: 422 });
    }

    return NextResponse.json({ task: response.parsed_output });
  } catch (error) {
    console.error("quick-add parse failed", error);
    return NextResponse.json({ error: "AI quick add failed, try again" }, { status: 502 });
  }
}
