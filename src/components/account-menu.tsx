"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountUser = { email: string; name: string | null };

function initialsFor(user: AccountUser) {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return initials.join("") || "?";
}

function Avatar({ user, className = "" }: { user: AccountUser; className?: string }) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 text-xs font-semibold text-white ${className}`}
    >
      {initialsFor(user)}
    </span>
  );
}

function ProfileForm({ user, onDone }: { user: AccountUser; onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't save your name");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Network error, try again");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't change your password");
        return;
      }
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Network error, try again");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update your display name or password.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-6 py-2">
        <form onSubmit={handleSaveName} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              placeholder="Add your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="self-start" disabled={savingName}>
            {savingName ? "Saving…" : "Save name"}
          </Button>
        </form>

        <Separator />

        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <Label className="text-sm font-medium">Change password</Label>
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="self-start"
            disabled={savingPassword}
          >
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
}

export function AccountMenu({ user }: { user: AccountUser }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar user={user} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col gap-0.5 px-2 py-1.5">
            <span className="text-sm font-medium text-foreground">
              {user.name || "Add your name"}
            </span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <Settings className="size-4" />
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={loggingOut}>
            <LogOut className="size-4" />
            {loggingOut ? "Logging out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          {profileOpen && <ProfileForm user={user} onDone={() => setProfileOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
