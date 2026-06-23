"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import type { UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const tr = translations[language];

  const baseLinks = [
    { href: "/dashboard", label: tr.nav.dashboard, icon: LayoutDashboard },
    { href: "/courses", label: tr.nav.courses, icon: BookOpen },
  ];

  const adminLinks = [
    { href: "/admin/instructors", label: tr.nav.instructors, icon: GraduationCap },
    { href: "/admin/students", label: tr.nav.students, icon: Users },
    { href: "/admin/reports", label: tr.nav.reports, icon: BarChart3 },
    { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  ];

  const tailLinks = [{ href: "/notifications", label: tr.nav.notifications, icon: Bell }];

  const links = [...baseLinks, ...(role === "admin" ? adminLinks : []), ...tailLinks];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 px-5 py-5">
        <Logo height={32} />
        <p className="text-xs font-medium capitalize tracking-wide text-foreground/50">{tr.portal[role]}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "brand-gradient text-primary-foreground shadow-md shadow-accent/20"
                  : "text-foreground/70 hover:translate-x-0.5 hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-surface-muted hover:text-danger"
        >
          <LogOut size={18} />
          {tr.nav.signOut}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Logo height={26} />
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/70"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">{content}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
