"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuickAddTask } from "@/lib/validation";

export const QUICK_ADD_INPUT_ID = "quick-add-input";

export function QuickAdd({ onParsed }: { onParsed: (parsed: QuickAddTask) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch("/api/tasks/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't parse that");
        return;
      }

      onParsed(data.task as QuickAddTask);
      setText("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.error("That took too long — try again");
      } else {
        toast.error("Network error, try again");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-background to-teal-50 p-3 dark:border-indigo-400/20 dark:from-indigo-950/40 dark:via-background dark:to-teal-950/20">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
        <Sparkles className="size-3.5" />
        AI quick add
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          id={QUICK_ADD_INPUT_ID}
          placeholder={'Try "Call the dentist tomorrow 3pm, high priority"'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className="bg-background"
        />
        <Button
          type="submit"
          disabled={loading || !text.trim()}
          className="shrink-0 bg-gradient-to-br from-indigo-600 to-teal-500 text-white hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          {loading ? "Thinking…" : "Parse it"}
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        Describe a task in plain English — Keel&apos;s AI turns it into a title, priority, and due date you can review before saving.
      </p>
    </div>
  );
}
