import { getApplicationsByApplicant } from "@/lib/api/applications";
import { getUserSession } from "@/lib/core/session";
import React from "react";
import ApplicationsTable from "./ApplicationsTable";

const ApplicationsPage = async () => {
  let jobs = [];
  try {
    const user = await getUserSession();
    jobs = await getApplicationsByApplicant(user.id);
  } catch (err) {
    console.error("Failed to fetch applications:", err);
  }

  return <ApplicationsTable jobs={jobs} />;
};

export default ApplicationsPage;