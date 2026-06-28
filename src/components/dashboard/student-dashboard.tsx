"use client";

import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { Card, ProgressBar, RingProgress, StatCard, SectionHeader, StatusBadge, EmptyState } from "@/components/ui";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { formatDate, isOverdue } from "@/lib/utils";
import { BookOpen, CheckCircle2, TrendingUp, GraduationCap, AlarmClock, Sparkles, Clock, ListTodo } from "lucide-react";
import type { Course, Session, Submission } from "@/lib/types";

interface Props {
  firstName: string;
  courses: Course[];
  sessionList: Session[];
  subList: Submission[];
  subMap: Map<string, Submission>;
  courseMap: Map<string, string>;
  total: number;
  reviewed: number;
  submitted: number;
  progress: number;
  avgGrade: number | null;
  upcoming: Session[];
}

export function StudentDashboard({
  firstName,
  courses,
  sessionList,
  subList,
  subMap,
  courseMap,
  total,
  reviewed,
  submitted,
  progress,
  avgGrade,
  upcoming,
}: Props) {
  const { language } = useLanguage();
  const tr = translations[language].dashboard;

  const missing = subList.filter((s) => s.status === "not_submitted").length;

  return (
    <div>
      <Topbar title={tr.title} subtitle={tr.studentSubtitle} />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <HeroBanner
          title={`${tr.welcomeBack}, ${firstName}!`}
          subtitle={`${reviewed} ${tr.of} ${total} ${tr.sessionsReviewed} · ${progress}% ${tr.overallProgressSuffix}`}
          icon={Sparkles}
          badge="Student Dashboard"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label={tr.enrolledCourses}
            value={courses.length}
            icon={<GraduationCap size={20} />}
            className="stagger-1"
          />
          <StatCard
            label={tr.totalSessions}
            value={total}
            icon={<BookOpen size={20} />}
            className="stagger-2"
          />
          <StatCard
            label={tr.reviewed}
            value={reviewed}
            icon={<CheckCircle2 size={20} />}
            accent="bg-success/10 text-success"
            className="stagger-3"
          />
          <StatCard
            label={tr.averageGrade}
            value={avgGrade !== null ? `${avgGrade}%` : "—"}
            icon={<TrendingUp size={20} />}
            accent="bg-highlight-soft text-highlight"
            className="stagger-4"
          />
        </div>

        {/* Progress section */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Ring Progress */}
          <Card className="card-hover flex flex-col items-center justify-center gap-4 py-6 lg:col-span-1">
            <RingProgress value={progress} size={120} stroke={10} label="Progress" />
            <div className="text-center">
              <p className="font-semibold text-foreground">{tr.overallProgress}</p>
              <p className="mt-1 text-sm text-foreground/50">
                {reviewed} {tr.of} {total} {tr.sessionsCompleted}
              </p>
            </div>
          </Card>

          {/* Detailed progress */}
          <Card className="card-hover lg:col-span-2">
            <SectionHeader title="Submission Summary" subtitle="Your task activity breakdown" />
            <div className="mt-4 space-y-4">
              {/* Reviewed */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground/65">
                    <CheckCircle2 size={14} className="text-success" />
                    Reviewed
                  </div>
                  <span className="font-semibold text-foreground">{reviewed} / {total}</span>
                </div>
                <ProgressBar value={total > 0 ? (reviewed / total) * 100 : 0} color="bg-success" />
              </div>

              {/* Submitted */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground/65">
                    <Clock size={14} className="text-amber-500" />
                    Pending Review
                  </div>
                  <span className="font-semibold text-foreground">{submitted}</span>
                </div>
                <ProgressBar value={total > 0 ? (submitted / total) * 100 : 0} color="bg-amber-500" />
              </div>

              {/* Missing */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground/65">
                    <ListTodo size={14} className="text-danger" />
                    Not Submitted
                  </div>
                  <span className="font-semibold text-foreground">{missing}</span>
                </div>
                <ProgressBar value={total > 0 ? (missing / total) * 100 : 0} color="bg-danger" />
              </div>
            </div>

            {/* Quick stat chips */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-success/10 p-3 text-center">
                <p className="text-lg font-bold text-success">{reviewed}</p>
                <p className="text-[11px] text-success/70">Reviewed</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                <p className="text-lg font-bold text-amber-500">{submitted}</p>
                <p className="text-[11px] text-amber-500/70">Pending</p>
              </div>
              <div className="rounded-xl bg-danger/10 p-3 text-center">
                <p className="text-lg font-bold text-danger">{missing}</p>
                <p className="text-[11px] text-danger/70">Missing</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <SectionHeader
            title={tr.upcomingDeadlines}
            subtitle={upcoming.length > 0 ? `${upcoming.length} pending deadline${upcoming.length !== 1 ? "s" : ""}` : undefined}
          />
          <div className="mt-3">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<AlarmClock size={22} />}
                title={tr.allCaughtUp}
                description={tr.noPendingDeadlines}
              />
            ) : (
              <div className="space-y-2">
                {upcoming.map((s, i) => {
                  const sub = subMap.get(s.id);
                  const overdue = isOverdue(s.deadline);
                  return (
                    <Link
                      key={s.id}
                      href={`/courses/${s.course_id}/sessions/${s.id}`}
                      className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)} flex flex-col gap-2 rounded-2xl border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${overdue ? "border-danger/30 hover:border-danger/50" : "border-border hover:border-accent/30"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${overdue ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}`}>
                          <AlarmClock size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{s.title}</p>
                          <p className="mt-0.5 text-xs text-foreground/50">
                            {courseMap.get(s.course_id)} · {s.assignment_title ?? tr.noAssignment}
                          </p>
                          <p className={`mt-1 text-xs font-medium ${overdue ? "text-danger" : "text-foreground/50"}`}>
                            {tr.due} {formatDate(s.deadline)}
                            {overdue && " · Overdue"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={sub?.status ?? "not_submitted"} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
