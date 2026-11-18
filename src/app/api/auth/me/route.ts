import { NextResponse } from "next/server";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema, updateProfileSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  // Changing the password is a distinct action from editing the display name,
  // so it gets its own validated branch (requires the current password).
  if (body && typeof body === "object" && "newPassword" in body) {
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!dbUser || !(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({ where: { id: sessionUser.id }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: sessionUser.id },
    data: { name: parsed.data.name },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return NextResponse.json({ user });
}
