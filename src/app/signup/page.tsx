import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/tasks");

  return (
    <AuthShell>
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
