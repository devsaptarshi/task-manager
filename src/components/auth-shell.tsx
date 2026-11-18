import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { KeelMark } from "@/components/keel-mark";

const FEATURES = [
  "Every task scoped to you — real auth and per-user data isolation, not a shared demo list",
  "Type a sentence, get a structured task — AI quick add parses it instantly",
  "Built the way it'd ship — tested, CI'd, and deployed, not just a prototype",
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-10 text-neutral-50 lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-1/4 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-40 [background-size:22px_22px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
            }}
          />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <KeelMark />
          Keel
        </Link>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            Plans that hold their course.
          </h1>
          <p className="text-neutral-300">
            Keel is a task manager built the way a real product ships — real
            auth, real data isolation, and an AI quick add that does one
            thing well instead of trying to be a chatbot.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-neutral-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-neutral-500">
          © {new Date().getFullYear()} Keel
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold lg:hidden">
          <KeelMark />
          Keel
        </Link>
        {children}
      </div>
    </div>
  );
}
