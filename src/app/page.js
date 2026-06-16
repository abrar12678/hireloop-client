import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";

import FeaturesJobs from "@/components/FeaturesJobs";
import Pricing from "@/components/Pricing";
import DiscoverJobs from "@/components/DiscoverJobs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Hero />
      <StatsSection />
      <DiscoverJobs />
      <FeaturesJobs />
      <Pricing />
    </div>
  );
}
