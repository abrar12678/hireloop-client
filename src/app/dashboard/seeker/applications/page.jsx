import { getApplicationsByApplicant } from "@/lib/api/applications";
import { getUserSession } from "@/lib/core/session";
import React from "react";
import ApplicationsContent from "./ApplicationsContent";

const ApplicationsPage = async () => {
  let jobs = [];
  try {
    const user = await getUserSession();
    jobs = await getApplicationsByApplicant(user.id);
  } catch (err) {
    console.error("Failed to fetch applications:", err);
  }

  return <ApplicationsContent jobs={jobs} />;
};

export default ApplicationsPage;