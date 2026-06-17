"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer2 from "@/components/Footer2";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer2 />
    </>
  );
}