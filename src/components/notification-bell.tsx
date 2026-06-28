"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Notification } from "@/lib/types";

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info size={13} className="text-blue-500" />,
  success: <CheckCircle2 size={13} className="text-success" />,
  warning: <AlertCircle size={13} className="text-warning" />,
  error: <AlertCircle size={13} className="text-danger" />,
};

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;

  async function handleOpen(n: Notification) {
    if (!n.read) {
      const supabase = createClient();
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
      router.refresh();
    }
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!unreadIds.length) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground/60 transition hover:bg-surface-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={17} className={unread > 0 ? "animate-bell-ring" : ""} />
          {unread > 0 && (
            <span className="animate-pulse-dot absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white shadow-sm">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Notifications</p>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-foreground/50 transition hover:bg-surface-muted hover:text-foreground"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
              <Bell size={18} className="text-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground/50">You&apos;re all caught up!</p>
            <p className="text-xs text-foreground/30">No new notifications</p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {notifications.slice(0, 8).map((n) => (
              <DropdownMenuItem key={n.id} asChild onSelect={() => handleOpen(n)}>
                <Link
                  href={n.link ?? "/notifications"}
                  className="flex items-start gap-3 !py-3 !px-3"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                    {typeIcons[n.type] ?? <Info size={13} className="text-foreground/40" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground/75"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-foreground/45">{n.body}</p>
                    )}
                    <p className="mt-1 text-[10px] text-foreground/30">{formatDateTime(n.created_at)}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-xs font-semibold text-primary">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
