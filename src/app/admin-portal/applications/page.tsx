import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplications, getApplicationStats } from "@/lib/actions/applications";
import { AdminPortalDashboard } from "@/components/admin-portal/dashboard";

export const metadata = { title: "Applications — EDUZAH Admin Portal" };

export default async function AdminPortalApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    <AdminPortalDashboard
      user={user}
      applications={applications}
      stats={stats}
      activeFilters={filters}
    />
  );
}
