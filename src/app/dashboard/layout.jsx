import { Inter } from "next/font/google";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const DashboardLayout = ({ children }) => {
  return (
    <div className={`${inter.variable} min-h-screen grid xl:grid-cols-[240px_1fr] bg-[#0E0E11]`}>
      <DashboardSidebar />
      <div className="flex flex-col min-w-0 min-h-screen">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;