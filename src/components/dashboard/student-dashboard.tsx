"use client";

import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { Card, ProgressBar, StatCard, StatusBadge, EmptyState } from "@/components/ui";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { formatDate, isOverdue } from "@/lib/utils";
import { BookOpen, CheckCircle2, TrendingUp, GraduationCap, AlarmClock, Sparkles } from "lucide-react";
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

  return (
    <div>
      <Topbar title={tr.title} subtitle={tr.studentSubtitle} />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <HeroBanner
          title={`${tr.welcomeBack}, ${firstName} 👋`}
          subtitle={`${reviewed} ${tr.of} ${total} ${tr.sessionsReviewed} · ${progress}% ${tr.overallProgressSuffix}`}
          icon={Sparkles}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={tr.enrolledCourses} value={courses.length} icon={<GraduationCap size={22} />} />
          <StatCard label={tr.totalSessions} value={total} icon={<BookOpen size={22} />} />
          <StatCard label={tr.reviewed} value={reviewed} icon={<CheckCircle2 size={22} />} accent="bg-success/10 text-success" />
          <StatCard label={tr.averageGrade} value={avgGrade !== null ? `${avgGrade}%` : "—"} icon={<TrendingUp size={22} />} accent="bg-highlight-soft text-highlight" />
        </div>

        <Card className="card-hover">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{tr.overallProgress}</h2>
            <span className="text-sm font-medium text-foreground/60">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <p className="mt-2 text-sm text-foreground/50">
            {reviewed} {tr.of} {total} {tr.sessionsCompleted} · {submitted} {tr.pendingReviewSuffix}.
          </p>
        </Card>

        <div>
          <h2 className="mb-3 font-semibold text-foreground">{tr.upcomingDeadlines}</h2>
          {upcoming.length === 0 ? (
            <EmptyState icon={<AlarmClock size={24} />} title={tr.allCaughtUp} description={tr.noPendingDeadlines} />
          ) : (
            <div className="space-y-2">
              {upcoming.map((s) => {
                const sub = subMap.get(s.id);
                return (
                  <Link
                    key={s.id}
                    href={`/courses/${s.course_id}/sessions/${s.id}`}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{s.title}</p>
                      <p className="text-sm text-foreground/50">
                        {courseMap.get(s.course_id)} · {s.assignment_title ?? tr.noAssignment} · {tr.due} {formatDate(s.deadline)}
                        {isOverdue(s.deadline) && <span className="ml-2 font-semibold text-danger">{tr.overdue}</span>}
                      </p>
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
  );
}
