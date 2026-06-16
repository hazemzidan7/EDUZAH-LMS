"use client";

import { Topbar } from "@/components/topbar";
import { Card, ProgressBar, StatCard } from "@/components/ui";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { CourseStatusChart, EnrollmentsByCategoryChart, AttendanceOverviewChart } from "@/components/dashboard/admin-charts";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { formatDate } from "@/lib/utils";
import { Users, Clock, GraduationCap, Layers, Sparkles } from "lucide-react";
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

  return (
    <div>
      <Topbar title={tr.title} subtitle={tr.adminSubtitle} />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <HeroBanner
          title={`${tr.welcomeBack}, ${firstName} 👋`}
          subtitle={`${courseCount} ${tr.courses} · ${studentCount} ${tr.totalStudents} · ${instructorCount} ${tr.instructorsLabel}`}
          icon={Sparkles}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={tr.totalCourses} value={courseCount} icon={<Layers size={22} />} />
          <StatCard label={tr.totalStudents} value={studentCount} icon={<Users size={22} />} />
          <StatCard label={tr.totalInstructors} value={instructorCount} icon={<GraduationCap size={22} />} accent="bg-accent-soft text-accent" />
          <StatCard label={tr.pendingReviews} value={pendingReview} icon={<Clock size={22} />} accent="bg-highlight-soft text-highlight" />
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-foreground">{tr.analytics}</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CourseStatusChart data={courseStatusData.length ? courseStatusData : [{ name: "No courses", value: 1 }]} />
            <EnrollmentsByCategoryChart data={enrollmentsByCategory.length ? enrollmentsByCategory : [{ name: "No data", value: 0 }]} />
            <AttendanceOverviewChart data={attendanceData.length ? attendanceData : [{ name: "No records", value: 1 }]} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="card-hover">
            <h2 className="mb-2 font-semibold text-foreground">{tr.assignmentCompletion}</h2>
            <ProgressBar value={completionRate} />
            <p className="mt-2 text-sm text-foreground/50">
              {reviewedCount} {tr.submissionsReviewed} {submittedCount} {tr.submissionsReviewedSuffix} ({completionRate}%)
            </p>
          </Card>

          <Card className="card-hover">
            <h2 className="mb-2 font-semibold text-foreground">{tr.recentActivity}</h2>
            {recentNotifications.length === 0 ? (
              <p className="py-4 text-sm text-foreground/50">{tr.noRecentActivity}</p>
            ) : (
              <ul className="space-y-2">
                {recentNotifications.map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-foreground/80">{n.title}</span>
                    <span className="shrink-0 text-xs text-foreground/40">{formatDate(n.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
