import { redirect } from "next/navigation";

import { Dashboard } from "@/components/admin/dashboard";
import { readSession } from "@/lib/analytics/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await readSession())) redirect("/admin");

  return <Dashboard />;
}
