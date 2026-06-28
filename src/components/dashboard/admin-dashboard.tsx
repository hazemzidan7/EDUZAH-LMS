"use client";

import { Topbar } from "@/components/topbar";
import { Card, StatCard, ProgressBar, SectionHeader, TableContainer, TableHeader, Th, TableBody, Tr, Td } from "@/components/ui";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { CourseStatusChart, EnrollmentsByCategoryChart, AttendanceOverviewChart } from "@/components/dashboard/admin-charts";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { formatDate } from "@/lib/utils";
import { Users, Clock, GraduationCap, Layers, Sparkles, CheckCircle2, BarChart2, Activity } from "lucide-react";
import type { Notification } from "@/lib/types";

interface Props {
  firstName: string;
  courseCount: number;
  studentCount: number;
  instructorCount: number;
  pendingReview: number;
  submittedCount: number;
  reviewedCount: number;
  completionRate: number;
  courseStatusData: { name: string; value: number }[];
  enrollmentsByCategory: { name: string; value: number }[];
  attendanceData: { name: string; value: number }[];
  recentNotifications: Notification[];
}

export function AdminDashboard({
  firstName,
  courseCount,
  studentCount,
  instructorCount,
  pendingReview,
  submittedCount,
  reviewedCount,
  completionRate,
  courseStatusData,
  enrollmentsByCategory,
  attendanceData,
  recentNotifications,
}: Props) {
  const { language } = useLanguage();
  const tr = translations[language].dashboard;

  const attendanceRate =
    attendanceData.length > 0
      ? Math.round(
          ((attendanceData.find((d) => d.name === "Present")?.value ?? 0) /
            attendanceData.reduce((a, b) => a + b.value, 0)) *
            100
        )
      : 0;

  return (
    <div>
      <Topbar title={tr.title} subtitle={tr.adminSubtitle} />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <HeroBanner
          title={`${tr.welcomeBack}, ${firstName}!`}
          subtitle={`${courseCount} ${tr.courses} · ${studentCount} ${tr.totalStudents} · ${instructorCount} ${tr.instructorsLabel}`}
          icon={Sparkles}
          badge="Admin Dashboard"
        />

        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label={tr.totalCourses}
            value={courseCount}
            icon={<Layers size={20} />}
            className="stagger-1"
          />
          <StatCard
            label={tr.totalStudents}
            value={studentCount}
            icon={<Users size={20} />}
            className="stagger-2"
          />
          <StatCard
            label={tr.totalInstructors}
            value={instructorCount}
            icon={<GraduationCap size={20} />}
            accent="bg-accent-soft text-accent"
            className="stagger-3"
          />
          <StatCard
            label={tr.pendingReviews}
            value={pendingReview}
            icon={<Clock size={20} />}
            accent="bg-highlight-soft text-highlight"
            className="stagger-4"
          />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Submissions"
            value={submittedCount}
            icon={<Activity size={20} />}
            accent="bg-blue-500/10 text-blue-500"
            className="stagger-1"
          />
          <StatCard
            label="Reviewed"
            value={reviewedCount}
            icon={<CheckCircle2 size={20} />}
            accent="bg-success/10 text-success"
            className="stagger-2"
          />
          <StatCard
            label="Completion Rate"
            value={`${completionRate}%`}
            icon={<BarChart2 size={20} />}
            accent="bg-chart-4/10 text-chart-4"
            className="stagger-3"
          />
          <StatCard
            label="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={<Users size={20} />}
            accent="bg-chart-5/10 text-chart-5"
            className="stagger-4"
          />
        </div>

        {/* Charts */}
        <div>
          <SectionHeader title={tr.analytics} subtitle="Overview of platform activity" />
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CourseStatusChart
              data={courseStatusData.length ? courseStatusData : [{ name: "No courses", value: 1 }]}
            />
            <EnrollmentsByCategoryChart
              data={enrollmentsByCategory.length ? enrollmentsByCategory : [{ name: "No data", value: 0 }]}
            />
            <AttendanceOverviewChart
              data={attendanceData.length ? attendanceData : [{ name: "No records", value: 1 }]}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Completion progress */}
          <Card className="card-hover">
            <SectionHeader title={tr.assignmentCompletion} subtitle={`${reviewedCount} reviewed of ${submittedCount} submitted`} />
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/55">Completion Rate</span>
                <span className="font-semibold text-foreground">{completionRate}%</span>
              </div>
              <ProgressBar value={completionRate} />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{submittedCount}</p>
                  <p className="text-[11px] text-foreground/45">Submitted</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{reviewedCount}</p>
                  <p className="text-[11px] text-foreground/45">Reviewed</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{pendingReview}</p>
                  <p className="text-[11px] text-foreground/45">Pending</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="card-hover">
            <SectionHeader title={tr.recentActivity} />
            <div className="mt-4">
              {recentNotifications.length === 0 ? (
                <p className="py-6 text-center text-sm text-foreground/40">{tr.noRecentActivity}</p>
              ) : (
                <div className="space-y-1">
                  {recentNotifications.map((n, i) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-muted"
                    >
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground/80">{n.title}</p>
                        {n.body && <p className="truncate text-xs text-foreground/40">{n.body}</p>}
                      </div>
                      <span className="shrink-0 text-[11px] text-foreground/35">{formatDate(n.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
