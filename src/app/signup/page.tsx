import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/tasks");

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <AuthForm mode="signup" />
    </div>
  );
}
