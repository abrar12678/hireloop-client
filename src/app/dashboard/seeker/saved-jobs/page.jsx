"use client";

import React, { useEffect, useState } from "react";
import { Table, Chip, Button, Tooltip } from "@heroui/react";
import { Bookmark, ArrowRight, MapPin, TrashBin, } from "@gravity-ui/icons";
import Link from "next/link";
import { protectedClientFetch, clientDelete } from "@/lib/core/client";

const formatSalary = (amount) => {
  if (!amount) return "0";
  const numericAmount = parseInt(amount, 10);
  return numericAmount >= 1000 ? `${numericAmount / 1000}k` : amount;
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

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    protectedClientFetch("/api/saved-jobs").then((data) => {
      if (!cancelled) {
        setSavedJobs(data || []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleRemove = async (savedJobId) => {
    try {
      await clientDelete(`/api/saved-jobs/${savedJobId}`);
      setSavedJobs((prev) => prev.filter((j) => (j._id?.$oid || j._id) !== savedJobId));
    } catch (err) {
      console.error("Failed to remove saved job:", err);
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
          Saved Jobs
        </h2>
        <p className="text-sm text-zinc-500">
          {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {savedJobs.length > 0 ? (
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
              <Table.Content aria-label="Saved jobs table">
                <Table.Header>
                  <Table.Column className="w-[35%]">Job Title</Table.Column>
                  <Table.Column className="w-[15%]">Company</Table.Column>
                  <Table.Column className="w-[15%]">Location</Table.Column>
                  <Table.Column className="w-[15%]">Salary</Table.Column>
                  <Table.Column className="w-[10%]">Saved</Table.Column>
                  <Table.Column className="w-[10%] text-right">Actions</Table.Column>
                </Table.Header>

                <Table.Body emptyContent={"No saved jobs found."}>
                  {savedJobs.map((item) => {
                    const savedId = item._id?.$oid || item._id;
                    const jobId = item.jobId;

                    return (
                      <Table.Row key={savedId}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {item.companyLogo && (
                              <img
                                src={item.companyLogo}
                                alt={item.companyName}
                                className="w-8 h-8 object-contain rounded-md"
                              />
                            )}
                            <span className="font-medium text-zinc-100 text-[15px]">
                              {item.jobTitle}
                            </span>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-zinc-300">{item.companyName}</span>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <MapPin className="text-purple-400 w-3.5 h-3.5" />
                            {item.isRemote ? "Remote" : item.location}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-zinc-300">
                            {item.salary ? `$${formatSalary(item.salary)}` : "Competitive"}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-zinc-500 text-xs">
                            {formatRelativeTime(item.savedAt?.$date || item.savedAt)}
                          </span>
                        </Table.Cell>

                        <Table.Cell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Tooltip content="Apply">
                              <Link href={`/jobs/${jobId}/apply`}>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  aria-label="Apply to job"
                                >
                                  <ArrowRight className="text-purple-400 w-4 h-4" />
                                </Button>
                              </Link>
                            </Tooltip>
                            <Tooltip content="Remove">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                aria-label="Remove saved job"
                                onPress={() => handleRemove(savedId)}
                              >
                                <TrashBin className="text-danger w-4 h-4" />
                              </Button>
                            </Tooltip>
                          </div>
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
          <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg mb-2">No saved jobs yet</p>
          <p className="text-zinc-600 text-sm">
            Browse jobs and save the ones that interest you.
          </p>
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Browse Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
