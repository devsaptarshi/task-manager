import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { quickAddTaskSchema, type QuickAddTask } from "@/lib/validation";

export type AiProvider = "anthropic" | "openai";

/** Picks whichever provider has a key configured; Anthropic wins if both are set. */
export function getAiProvider(): AiProvider | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

function quickAddSystemPrompt() {
  const now = new Date().toISOString();
  return `You turn one sentence describing a task into a structured task. Today's date/time (ISO 8601, for resolving relative dates like "tomorrow" or "next Friday") is ${now}. If no priority is stated or implied, use MEDIUM. If no date/time is mentioned, dueDate must be null.`;
}

/** Parses a free-text task description into a structured task via whichever AI provider is configured. */
export async function parseQuickAddTask(text: string): Promise<QuickAddTask | null> {
  const provider = getAiProvider();
  const system = quickAddSystemPrompt();

  // Bounds both latency (a hung provider call can't stall the request forever)
  // and cost (a capped max output size, enforced on every call below).
  const REQUEST_TIMEOUT_MS = 20_000;

  if (provider === "anthropic") {
    const client = new Anthropic({ timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 512,
      system,
      messages: [{ role: "user", content: text }],
      output_config: { format: zodOutputFormat(quickAddTaskSchema) },
    });
    return response.parsed_output;
  }

  if (provider === "openai") {
    const client = new OpenAI({ timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
    const response = await client.responses.parse({
      model: "gpt-6-luna",
      max_output_tokens: 512,
      input: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      text: { format: zodTextFormat(quickAddTaskSchema, "task") },
    });
    return response.output_parsed ?? null;
  }

  return null;
}
