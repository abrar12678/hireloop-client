"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminDashboardLayout = ({ children }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/auth/signIn");
      return;
    }
    if (session.user.role !== "admin") {
      router.replace("/unauthorized");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user || session.user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
};

export default AdminDashboardLayout;