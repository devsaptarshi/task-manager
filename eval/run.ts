/**
 * Eval for the AI quick-add parser (src/lib/ai.ts#parseQuickAddTask).
 * Calls the SAME function the live /api/tasks/parse route calls — no
 * reimplementation of the Claude/OpenAI request.
 *
 * Usage: npm run eval
 * Writes a timestamped JSON + Markdown report to eval/results/.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cases, type EvalCase, type ExpectedDueDate } from "./cases";
import { getAiProvider, parseQuickAddTask } from "../src/lib/ai";
import type { QuickAddTask } from "../src/lib/validation";

type CaseResult = {
  id: string;
  phrase: string;
  status: "ok" | "error";
  error?: string;
  parsed?: QuickAddTask;
  grade?: {
    priority: boolean;
    title: boolean;
    dueDate: boolean;
    overall: boolean;
  };
};

function expectedDateMatches(expected: ExpectedDueDate, runStart: Date, parsedIso: string | null): boolean {
  if (expected === null) return parsedIso === null;
  if (parsedIso === null) return false;

  const parsed = new Date(parsedIso);
  if (Number.isNaN(parsed.getTime())) return false;

  const target = new Date(runStart);
  target.setDate(target.getDate() + expected.days);

  const sameDay =
    parsed.getFullYear() === target.getFullYear() &&
    parsed.getMonth() === target.getMonth() &&
    parsed.getDate() === target.getDate();

  if (expected.hour === undefined) return sameDay;

  return sameDay && parsed.getHours() === expected.hour && parsed.getMinutes() === (expected.minute ?? 0);
}

function titleMatches(keywords: string[], title: string): boolean {
  const lower = title.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

async function runCase(testCase: EvalCase, runStart: Date): Promise<CaseResult> {
  try {
    const parsed = await parseQuickAddTask(testCase.phrase);
    if (!parsed) {
      return { id: testCase.id, phrase: testCase.phrase, status: "error", error: "parser returned null" };
    }

    const priority = parsed.priority === testCase.expectedPriority;
    const title = titleMatches(testCase.expectedTitleKeywords, parsed.title);
    const dueDate = expectedDateMatches(testCase.expectedDueDate, runStart, parsed.dueDate);

    return {
      id: testCase.id,
      phrase: testCase.phrase,
      status: "ok",
      parsed,
      grade: { priority, title, dueDate, overall: priority && title && dueDate },
    };
  } catch (err) {
    return {
      id: testCase.id,
      phrase: testCase.phrase,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function pct(n: number, d: number): string {
  return d === 0 ? "n/a" : `${((n / d) * 100).toFixed(0)}%`;
}

async function main() {
  const provider = getAiProvider();
  if (!provider) {
    console.error("No AI provider configured — set ANTHROPIC_API_KEY or OPENAI_API_KEY before running the eval.");
    process.exit(1);
  }

  const runStart = new Date();
  console.log(`Running ${cases.length} cases against provider: ${provider}\n`);

  const results: CaseResult[] = [];
  for (const testCase of cases) {
    const result = await runCase(testCase, runStart);
    results.push(result);
    const label =
      result.status === "error"
        ? `ERROR (${result.error})`
        : result.grade!.overall
          ? "PASS"
          : `FAIL [priority:${result.grade!.priority ? "ok" : "X"} title:${result.grade!.title ? "ok" : "X"} dueDate:${result.grade!.dueDate ? "ok" : "X"}]`;
    console.log(`${result.id.padEnd(30)} ${label}`);
  }

  const ok = results.filter((r) => r.status === "ok");
  const errors = results.filter((r) => r.status === "error");
  const priorityCorrect = ok.filter((r) => r.grade!.priority).length;
  const titleCorrect = ok.filter((r) => r.grade!.title).length;
  const dueDateCorrect = ok.filter((r) => r.grade!.dueDate).length;
  const overallCorrect = ok.filter((r) => r.grade!.overall).length;

  console.log(`\n${cases.length} cases, ${errors.length} errors, ${ok.length} graded`);
  console.log(`  priority accuracy: ${priorityCorrect}/${ok.length} (${pct(priorityCorrect, ok.length)})`);
  console.log(`  title accuracy:    ${titleCorrect}/${ok.length} (${pct(titleCorrect, ok.length)})`);
  console.log(`  dueDate accuracy:  ${dueDateCorrect}/${ok.length} (${pct(dueDateCorrect, ok.length)})`);
  console.log(`  overall (all 3):   ${overallCorrect}/${ok.length} (${pct(overallCorrect, ok.length)})`);

  const outDir = join(__dirname, "results");
  mkdirSync(outDir, { recursive: true });
  const timestamp = runStart.toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(outDir, `${timestamp}.json`);
  const mdPath = join(outDir, `${timestamp}.md`);

  writeFileSync(jsonPath, JSON.stringify({ provider, runStart: runStart.toISOString(), results }, null, 2));

  const mdLines = [
    `# Quick-add eval report`,
    ``,
    `Provider: **${provider}** · Run: ${runStart.toISOString()}`,
    ``,
    `| Metric | Correct / graded | Accuracy |`,
    `|---|---|---|`,
    `| Priority | ${priorityCorrect}/${ok.length} | ${pct(priorityCorrect, ok.length)} |`,
    `| Title | ${titleCorrect}/${ok.length} | ${pct(titleCorrect, ok.length)} |`,
    `| Due date | ${dueDateCorrect}/${ok.length} | ${pct(dueDateCorrect, ok.length)} |`,
    `| **Overall (all 3 must pass)** | **${overallCorrect}/${ok.length}** | **${pct(overallCorrect, ok.length)}** |`,
    ``,
    errors.length ? `**${errors.length} case(s) errored and were excluded from accuracy:**\n` : ``,
    ...errors.map((e) => `- \`${e.id}\`: ${e.error}`),
    ``,
    `## Per-case detail`,
    ``,
    `| id | phrase | priority | title | dueDate | parsed |`,
    `|---|---|---|---|---|---|`,
    ...ok.map((r) => {
      const g = r.grade!;
      const p = r.parsed!;
      return `| ${r.id} | ${r.phrase} | ${g.priority ? "✓" : "✗"} ${p.priority} | ${g.title ? "✓" : "✗"} "${p.title}" | ${g.dueDate ? "✓" : "✗"} ${p.dueDate ?? "null"} | ${JSON.stringify(p)} |`;
    }),
  ];
  writeFileSync(mdPath, mdLines.join("\n"));

  console.log(`\nWrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}

main();
