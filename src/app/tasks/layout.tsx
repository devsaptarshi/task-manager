import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { KeelMark } from "@/components/keel-mark";
import { AccountMenu } from "@/components/account-menu";

export default async function TasksLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-semibold">
            <KeelMark />
            Keel
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AccountMenu user={{ email: user.email, name: user.name }} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
