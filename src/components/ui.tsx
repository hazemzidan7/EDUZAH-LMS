"use client";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import type { SubmissionStatus, CourseStatus, AttendanceStatus } from "@/lib/types";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  accent,
  trend,
  trendLabel,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}) {
  const trendConfig = {
    up: { icon: TrendingUp, className: "text-success" },
    down: { icon: TrendingDown, className: "text-danger" },
    neutral: { icon: Minus, className: "text-foreground/40" },
  };

  return (
    <Card className={cn("card-hover group animate-fade-in-up", className)}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            accent ?? "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </div>
        {trend && trendLabel && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendConfig[trend].className)}>
            {(() => { const TIcon = trendConfig[trend].icon; return <TIcon size={12} />; })()}
            {trendLabel}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="animate-count-up text-2xl font-bold text-foreground">{value}</p>
        <p className="mt-0.5 text-sm text-foreground/55">{label}</p>
      </div>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-foreground/45">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

export function ProgressBar({ value, className, color }: { value: number; className?: string; color?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", color ?? "brand-gradient")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Ring Progress ─────────────────────────────────────────────────────────────

export function RingProgress({
  value,
  size = 88,
  stroke = 8,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">{value}%</span>
        {label && <span className="text-[10px] text-foreground/45">{label}</span>}
      </div>
    </div>
  );
}

// ─── Status Badges ─────────────────────────────────────────────────────────────

const statusStyles: Record<SubmissionStatus, string> = {
  not_submitted: "bg-zinc-500/10 text-zinc-500",
  submitted: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  late: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  reviewed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const statusLabels: Record<SubmissionStatus, string> = {
  not_submitted: "Not Submitted",
  submitted: "Submitted",
  late: "Late",
  reviewed: "Reviewed",
  approved: "Approved",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

const courseStatusStyles: Record<CourseStatus, string> = {
  draft: "bg-zinc-500/10 text-zinc-500",
  active: "bg-success/10 text-success",
  archived: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize", courseStatusStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const attendanceStyles: Record<AttendanceStatus, string> = {
  present: "bg-success/10 text-success",
  absent: "bg-danger/10 text-danger",
  late: "bg-warning/10 text-warning",
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize", attendanceStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground/70", className)}>
      {children}
    </span>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient-soft text-foreground/40">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-xs text-sm text-foreground/50">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────────

export function TableContainer({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-surface-muted/60">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45", className)}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("transition-colors hover:bg-surface-muted/50", className)}>{children}</tr>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3.5 text-foreground/80", className)}>{children}</td>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-skeleton rounded-lg bg-surface-muted", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <Skeleton className="h-28 w-full rounded-2xl" />
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <Skeleton className="mb-3 h-11 w-11 rounded-xl" />
            <Skeleton className="mb-1.5 h-7 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Form Components ───────────────────────────────────────────────────────────

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition placeholder:text-foreground/35 focus:ring-2",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition placeholder:text-foreground/35 focus:ring-2",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition focus:ring-2",
        props.className
      )}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary: "brand-gradient text-white shadow-sm shadow-accent/20 hover:opacity-90 hover:shadow-md hover:shadow-accent/30",
    secondary: "bg-surface-muted text-foreground border border-border hover:bg-border",
    danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
    ghost: "text-foreground/70 hover:bg-surface-muted hover:text-foreground",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
    />
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

export function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  return (
    <AvatarPrimitive.Root
      className="inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-surface"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src && <AvatarPrimitive.Image src={src} alt={name} className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback>{getInitials(name)}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

// ─── Dialog ────────────────────────────────────────────────────────────────────

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="animate-scale-in fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-2xl focus:outline-none">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-foreground">{title}</DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-sm text-foreground/50">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/40 transition hover:bg-surface-muted hover:text-foreground">
              <X size={16} />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ─── Dropdown ──────────────────────────────────────────────────────────────────

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={8}
        className={cn(
          "animate-scale-in z-50 min-w-[200px] rounded-2xl border border-border bg-surface p-1.5 shadow-xl shadow-black/10",
          className
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/75 outline-none transition data-[highlighted]:bg-surface-muted data-[highlighted]:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

export function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <TabsPrimitive.List className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className="rounded-lg px-4 py-1.5 text-sm font-medium text-foreground/55 transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  return <TabsPrimitive.Content value={value}>{children}</TabsPrimitive.Content>;
}
