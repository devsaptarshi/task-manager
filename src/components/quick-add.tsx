"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuickAddTask } from "@/lib/validation";

export function QuickAdd({ onParsed }: { onParsed: (parsed: QuickAddTask) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't parse that");
        return;
      }

      onParsed(data.task as QuickAddTask);
      setText("");
    } catch {
      toast.error("Network error, try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder={'Try "Call the dentist tomorrow 3pm, high priority"'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !text.trim()}>
        {loading ? "Thinking…" : "AI quick add"}
      </Button>
    </form>
  );
}
