"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Network error, try again");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-none shadow-xl shadow-black/5">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isSignup ? "Create your account" : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {isSignup
            ? "Start managing your tasks in under a minute."
            : "Log in to pick up where you left off."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={isSignup ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </>
            ) : (
              <>
                Need an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
