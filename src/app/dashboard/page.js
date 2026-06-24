import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/core/session";

const DASHBOARD_MAP = {
  seeker: "/dashboard/seeker",
  recruiter: "/dashboard/recruiter",
  admin: "/dashboard/admin",
};

export default async function DashboardRootPage() {
  let user;
  try {
    user = await getUserSession();
  } catch {
    redirect("/auth/signIn");
  }

  if (!user) {
    redirect("/auth/signIn");
  }

  const target = DASHBOARD_MAP[user.role] || "/dashboard/seeker";
  redirect(target);
}