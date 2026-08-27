import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { readSession } from "@/lib/analytics/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await readSession()) redirect("/admin/dashboard");

  return <LoginForm />;
}
