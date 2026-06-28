"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui";
import { useDashboard } from "@/lib/dashboard-context";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: { label: "Administrator", className: "bg-accent-soft text-accent" },
  instructor: { label: "Instructor", className: "bg-highlight-soft text-highlight" },
  student: { label: "Student", className: "bg-primary-soft text-primary" },
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useDashboard();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useLanguage();
  const tr = translations[language];

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

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

  function NavItem({ href, label, icon: Icon, isDrawer = false }: { href: string; label: string; icon: React.ElementType; isDrawer?: boolean }) {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
    const showLabel = !collapsed || isDrawer;

    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        data-tooltip={collapsed && !isDrawer ? label : undefined}
        className={cn(
          "sidebar-tooltip flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
          showLabel ? "px-3 py-2.5" : "mx-auto h-10 w-10 justify-center p-0",
          active
            ? "brand-gradient text-white shadow-md shadow-accent/20"
            : "text-foreground/65 hover:bg-surface-muted hover:text-foreground"
        )}
      >
        <Icon size={18} className="shrink-0" />
        {showLabel && <span className="truncate">{label}</span>}
      </Link>
    );
  }

  function SidebarContent({ isDrawer = false }: { isDrawer?: boolean }) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border",
            !collapsed || isDrawer ? "justify-between px-4" : "justify-center px-2"
          )}
        >
          {(!collapsed || isDrawer) ? (
            <Logo height={28} />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient shadow-sm">
              <span className="text-xs font-bold text-white">E</span>
            </div>
          )}
          {!isDrawer && (
            <button
              onClick={toggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-muted text-foreground/50 transition hover:bg-border hover:text-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Role badge */}
        {(!collapsed || isDrawer) && (
          <div className="shrink-0 px-4 pb-1 pt-3">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", roleConfig[role].className)}>
              {roleConfig[role].label}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className={cn("flex-1 overflow-y-auto py-2", !collapsed || isDrawer ? "space-y-0.5 px-2" : "flex flex-col items-center gap-1 px-1")}>
          {(!collapsed || isDrawer) && role === "admin" && (
            <p className="mb-1 mt-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-foreground/30">Main</p>
          )}
          <NavItem href="/dashboard" label={tr.nav.dashboard} icon={LayoutDashboard} isDrawer={isDrawer} />
          <NavItem href="/courses" label={tr.nav.courses} icon={BookOpen} isDrawer={isDrawer} />

          {role === "admin" && (
            <>
              {(!collapsed || isDrawer) && (
                <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-foreground/30">Management</p>
              )}
              {collapsed && !isDrawer && <div className="my-1 h-px w-8 bg-border" />}
              <NavItem href="/admin/instructors" label={tr.nav.instructors} icon={GraduationCap} isDrawer={isDrawer} />
              <NavItem href="/admin/students" label={tr.nav.students} icon={Users} isDrawer={isDrawer} />
              <NavItem href="/admin/reports" label={tr.nav.reports} icon={BarChart3} isDrawer={isDrawer} />
              <NavItem href="/admin/applications" label="Applications" icon={ClipboardList} isDrawer={isDrawer} />
            </>
          )}

          {(!collapsed || isDrawer) && (
            <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-foreground/30">Other</p>
          )}
          {collapsed && !isDrawer && <div className="my-1 h-px w-8 bg-border" />}
          <NavItem href="/notifications" label={tr.nav.notifications} icon={Bell} isDrawer={isDrawer} />
        </nav>

        {/* Footer */}
        <div className={cn("shrink-0 border-t border-border", !collapsed || isDrawer ? "p-3" : "flex flex-col items-center gap-1 p-2")}>
          {/* User profile card */}
          {(!collapsed || isDrawer) && (
            <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-surface-muted px-3 py-2.5">
              <Avatar name={profile.name} src={profile.avatar_url} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{profile.name}</p>
                <p className="truncate text-[11px] text-foreground/45">{profile.email}</p>
              </div>
            </div>
          )}
          {collapsed && !isDrawer && (
            <div className="mb-1">
              <Avatar name={profile.name} src={profile.avatar_url} size={32} />
            </div>
          )}
          <button
            onClick={handleSignOut}
            data-tooltip={collapsed && !isDrawer ? tr.nav.signOut : undefined}
            className={cn(
              "sidebar-tooltip flex items-center gap-2.5 rounded-xl text-sm font-medium text-foreground/60 transition hover:bg-danger/10 hover:text-danger",
              !collapsed || isDrawer ? "w-full px-3 py-2" : "h-9 w-9 justify-center p-0"
            )}
          >
            <LogOut size={16} className="shrink-0" />
            {(!collapsed || isDrawer) && <span>{tr.nav.signOut}</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Logo height={26} />
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/60 transition hover:bg-surface-muted"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:h-full lg:shrink-0 border-r border-border bg-surface transition-all duration-300 ease-in-out",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 w-72 bg-surface shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:bg-surface-muted hover:text-foreground"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            <SidebarContent isDrawer />
          </aside>
        </div>
      )}
    </>
  );
}
