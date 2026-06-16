"use client";

import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { StatCard, EmptyState, StatusBadge } from "@/components/ui";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { formatDate } from "@/lib/utils";
import { Users, Clock, BookOpen, Layers, ClipboardCheck, LayoutDashboard } from "lucide-react";
import type { Course, Session, Submission } from "@/lib/types";

interface Props {
  firstName: string;
  courses: Course[];
  sessionList: Session[];
  totalStudents: number;
  pendingReview: number;
  recentSubmissions: Submission[];
  sessionMap: Map<string, Session>;
  courseMap: Map<string, string>;
  studentMap: Map<string, string>;
}

export function InstructorDashboard({
  firstName,
  courses,
  sessionList,
  totalStudents,
  pendingReview,
  recentSubmissions,
  sessionMap,
  courseMap,
  studentMap,
}: Props) {
  const { language } = useLanguage();
  const tr = translations[language].dashboard;

  return (
    <div>
      <Topbar
        title={tr.title}
        subtitle={tr.instructorSubtitle}
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <HeroBanner
          title={`${tr.welcomeBack}, ${firstName} 👋`}
          subtitle={`${courses.length} ${tr.assignedCoursesLabel} · ${pendingReview} ${tr.submissionsAwaiting}`}
          icon={LayoutDashboard}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={tr.assignedCourses} value={courses.length} icon={<Layers size={22} />} />
          <StatCard label={tr.totalStudents} value={totalStudents} icon={<Users size={22} />} />
          <StatCard label={tr.pendingReview} value={pendingReview} icon={<Clock size={22} />} accent="bg-highlight-soft text-highlight" />
          <StatCard label={tr.totalSessions} value={sessionList.length} icon={<BookOpen size={22} />} />
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-foreground">{tr.recentSubmissions}</h2>
          {recentSubmissions.length === 0 ? (
            <EmptyState icon={<ClipboardCheck size={24} />} title={tr.noSubmissionsYet} description={tr.submissionsWillAppear} />
          ) : (
            <div className="card-hover overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase text-foreground/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">{tr.student}</th>
                    <th className="px-4 py-3 font-medium">{tr.course}</th>
                    <th className="px-4 py-3 font-medium">{tr.session}</th>
                    <th className="px-4 py-3 font-medium">{tr.submitted}</th>
                    <th className="px-4 py-3 font-medium">{tr.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSubmissions.map((s) => {
                    const session = sessionMap.get(s.session_id);
                    return (
                      <tr key={s.id} className="transition-colors hover:bg-surface-muted/60">
                        <td className="px-4 py-3 font-medium text-foreground">{studentMap.get(s.student_id) ?? "Unknown"}</td>
                        <td className="px-4 py-3 text-foreground/70">{session ? courseMap.get(session.course_id) : "—"}</td>
                        <td className="px-4 py-3 text-foreground/70">{session?.title ?? "—"}</td>
                        <td className="px-4 py-3 text-foreground/50">{formatDate(s.submitted_at)}</td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
