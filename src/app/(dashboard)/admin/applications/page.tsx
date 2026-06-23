import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplications, getApplicationStats } from "@/lib/actions/applications";
import { ApplicationsDashboard } from "@/components/admin/applications-dashboard";

export const metadata = { title: "Applications — EDUZAH Admin" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const filters = {
    position: params.position || undefined,
    positionType: params.positionType || undefined,
    status: params.status || undefined,
    graduationYear: params.graduationYear || undefined,
    academicStatus: params.academicStatus || undefined,
    governorate: params.governorate || undefined,
  };

  const [applications, stats] = await Promise.all([
    getApplications(filters),
    getApplicationStats(),
  ]);

  return (
    <ApplicationsDashboard
      applications={applications}
      stats={stats}
      activeFilters={filters}
    />
  );
}
