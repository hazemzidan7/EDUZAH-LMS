"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui";
import { LogOut, User, Settings, Shield, BookOpen, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import type { Profile, UserRole } from "@/lib/types";

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; className: string }> = {
  admin: { label: "Administrator", icon: <Shield size={12} />, className: "bg-accent-soft text-accent" },
  instructor: { label: "Instructor", icon: <BookOpen size={12} />, className: "bg-highlight-soft text-highlight" },
  student: { label: "Student", icon: <User size={12} />, className: "bg-primary-soft text-primary" },
};

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { language } = useLanguage();
  const tr = translations[language];
  const role = roleConfig[profile.role];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5 transition hover:bg-surface-muted">
          <Avatar name={profile.name} src={profile.avatar_url} size={28} />
          <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground sm:block">
            {profile.name.split(" ")[0]}
          </span>
          <ChevronDown size={13} className="hidden text-foreground/40 sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {/* Profile card */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} src={profile.avatar_url} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
              <p className="truncate text-xs text-foreground/45">{profile.email}</p>
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${role.className}`}>
              {role.icon} {role.label}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="gap-2.5">
            <User size={15} className="text-foreground/50" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleSignOut} className="text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger">
          <LogOut size={15} />
          {tr.nav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
