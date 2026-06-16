"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Briefcase, FileText, Bookmark, ChartLineArrowUp, } from "@gravity-ui/icons";

const SeekerDashboard = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const res = await fetch(`${baseUrl}/api/seeker/stats`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStatsData([
            { id: "applications", title: "Applications", value: data.applicationsCount || 0, icon: FileText },
            { id: "saved", title: "Saved Jobs", value: data.savedJobsCount || 0, icon: Bookmark },
            { id: "trending", title: "Interview Rate", value: "85%", icon: ChartLineArrowUp },
            { id: "profile", title: "Profile Views", value: data.profileViews || 42, icon: Briefcase },
          ]);
        }
      } catch (err) { console.error(err); }
    };
    if (user) fetchStats();
  }, [user]);

  if (isPending) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back, {user?.name}</h2>
        <p className="text-sm text-zinc-500">Here is your job search overview.</p>
      </div>
      <DashboardStats statsData={statsData} />
    </div>
  );
};

export default SeekerDashboard;