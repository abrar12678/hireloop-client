"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Table, Chip, Button } from "@heroui/react";
import { FileText } from "@gravity-ui/icons";
import { updateApplicationStatus } from "@/lib/action/applications";

const statusOptions = ["Applied", "Under Review", "Shortlisted", "Rejected", "Offered"];

const getStatusChip = (status = "Applied") => {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "applied":
      return <Chip variant="bordered" className="border-zinc-600 text-zinc-100 text-xs font-medium px-3 py-1">Applied</Chip>;
    case "review":
    case "under review":
      return <Chip variant="bordered" className="border-amber-600/70 text-amber-500 text-xs font-medium px-3 py-1 bg-amber-950/20">Under Review</Chip>;
    case "shortlisted":
      return <Chip variant="bordered" className="border-emerald-600/70 text-emerald-500 text-xs font-medium px-3 py-1 bg-emerald-950/20">Shortlisted</Chip>;
    case "rejected":
      return <Chip variant="bordered" className="border-rose-700/70 text-rose-600 text-xs font-medium px-3 py-1 bg-rose-950/20">Rejected</Chip>;
    case "offered":
      return <Chip variant="bordered" className="border-purple-500/70 text-purple-400 text-xs font-medium px-3 py-1 bg-purple-950/20">Offered</Chip>;
    default:
      return <Chip variant="bordered" className="border-zinc-600 text-zinc-100 text-xs font-medium">{status}</Chip>;
  }
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24) return diffInHours <= 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

const fetchApplicantsData = async (id) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/applications?jobId=${id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error("Failed to fetch applicants:", err);
  }
  return [];
};

const ApplicantsPage = ({ params: paramsPromise }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    paramsPromise.then(async (p) => {
      const id = p.jobId;
      if (cancelled) return;
      setJobId(id);
      const data = await fetchApplicantsData(id);
      if (!cancelled) {
        setApplicants(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [paramsPromise]);

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await updateApplicationStatus(applicantId, newStatus);
      setApplicants((prev) =>
        prev.map((a) =>
          (a._id?.$oid || a._id) === applicantId
            ? { ...a, status: newStatus }
            : a
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Applicants
        </h2>
        <p className="text-sm text-zinc-500">
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} for this position
        </p>
      </div>

      {applicants.length > 0 ? (
        <div className="w-full bg-[#121212] p-6 rounded-xl border border-zinc-800/80 text-zinc-100">
          <Table
            className="w-full"
            classNames={{
              base: "bg-transparent",
              table: "border-collapse",
              thead: "[&>tr]:border-b [&>tr]:border-zinc-800/60",
              th: "bg-transparent text-zinc-400 font-medium text-sm py-4 border-b border-zinc-800/60 first:pl-4 last:pr-4",
              tr: "border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors last:border-none",
              td: "py-4 align-middle first:pl-4 last:pr-4 text-zinc-300 text-sm",
            }}
          >
            <Table.ScrollContainer>
              <Table.Content aria-label="Job applicants table">
                <Table.Header>
                  <Table.Column className="w-[25%]">Applicant Name</Table.Column>
                  <Table.Column className="w-[25%]">Email</Table.Column>
                  <Table.Column className="w-[15%]">Date Applied</Table.Column>
                  <Table.Column className="w-[10%]">Resume</Table.Column>
                  <Table.Column className="w-[15%]">Status</Table.Column>
                  <Table.Column className="w-[10%]">Update Status</Table.Column>
                </Table.Header>

                <Table.Body emptyContent={"No applicants yet."}>
                  {applicants.map((applicant) => {
                    const appId = applicant._id?.$oid || applicant._id;
                    return (
                      <Table.Row key={appId}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                              {applicant.applicantName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span className="font-medium text-zinc-100">
                              {applicant.applicantName || "Unknown"}
                            </span>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-zinc-400">{applicant.applicantEmail || "N/A"}</span>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-zinc-500 text-xs">
                            {formatRelativeTime(applicant.createdAt?.$date || applicant.createdAt)}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          {applicant.resumeUrl ? (
                            <a
                              href={applicant.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-xs">None</span>
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          {getStatusChip(applicant.status)}
                        </Table.Cell>

                        <Table.Cell>
                          <select
                            value={applicant.status || "Applied"}
                            onChange={(e) => handleStatusChange(appId, e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s} className="bg-zinc-800">
                                {s}
                              </option>
                            ))}
                          </select>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-lg">No applicants for this position yet.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;