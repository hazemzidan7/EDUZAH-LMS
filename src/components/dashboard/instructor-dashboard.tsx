"use client";

import { Topbar } from "@/components/topbar";
import { StatCard, SectionHeader, EmptyState, StatusBadge, TableContainer, TableHeader, Th, TableBody, Tr, Td, Avatar } from "@/components/ui";
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
      <Topbar title={tr.title} subtitle={tr.instructorSubtitle} />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <HeroBanner
          title={`${tr.welcomeBack}, ${firstName}!`}
          subtitle={`${courses.length} ${tr.assignedCoursesLabel} · ${pendingReview} ${tr.submissionsAwaiting}`}
          icon={LayoutDashboard}
          badge="Instructor Dashboard"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label={tr.assignedCourses}
            value={courses.length}
            icon={<Layers size={20} />}
            className="stagger-1"
          />
          <StatCard
            label={tr.totalStudents}
            value={totalStudents}
            icon={<Users size={20} />}
            className="stagger-2"
          />
          <StatCard
            label={tr.pendingReview}
            value={pendingReview}
            icon={<Clock size={20} />}
            accent="bg-highlight-soft text-highlight"
            className="stagger-3"
          />
          <StatCard
            label={tr.totalSessions}
            value={sessionList.length}
            icon={<BookOpen size={20} />}
            accent="bg-primary-soft text-primary"
            className="stagger-4"
          />
        </div>

        {/* Recent Submissions */}
        <div>
          <SectionHeader
            title={tr.recentSubmissions}
            subtitle="Latest student submissions across all your courses"
          />
          <div className="mt-3">
            {recentSubmissions.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck size={22} />}
                title={tr.noSubmissionsYet}
                description={tr.submissionsWillAppear}
              />
            ) : (
              <TableContainer className="card-hover">
                <TableHeader>
                  <Th>{tr.student}</Th>
                  <Th>{tr.course}</Th>
                  <Th className="hidden md:table-cell">{tr.session}</Th>
                  <Th className="hidden sm:table-cell">{tr.submitted}</Th>
                  <Th>{tr.status}</Th>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.map((s) => {
                    const session = sessionMap.get(s.session_id);
                    const studentName = studentMap.get(s.student_id) ?? "Unknown";
                    return (
                      <Tr key={s.id}>
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={studentName} size={28} />
                            <span className="font-medium text-foreground">{studentName}</span>
                          </div>
                        </Td>
                        <Td className="text-foreground/60">
                          {session ? courseMap.get(session.course_id) ?? "—" : "—"}
                        </Td>
                        <Td className="hidden text-foreground/60 md:table-cell">
                          {session?.title ?? "—"}
                        </Td>
                        <Td className="hidden text-foreground/45 sm:table-cell">
                          {formatDate(s.submitted_at)}
                        </Td>
                        <Td>
                          <StatusBadge status={s.status} />
                        </Td>
                      </Tr>
                    );
                  })}
                </TableBody>
              </TableContainer>
            )}
          </div>
        </div>

        {/* Courses quick list */}
        {courses.length > 0 && (
          <div>
            <SectionHeader title="Your Courses" subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""} assigned`} />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <div
                  key={course.id}
                  className="card-hover flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{course.title}</p>
                    <p className="truncate text-xs text-foreground/45 capitalize">{course.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
