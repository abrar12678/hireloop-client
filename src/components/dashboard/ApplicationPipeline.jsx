"use client";

import React, { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";

/*
  Indeed-like step-by-step application pipeline.
  Used by recruiter to advance/reject candidates through the hiring funnel.
  
  Pipeline stages:
    Applied → Under Review → Shortlisted → Interview Scheduled → Offered → Hired
                                                                    └→ Rejected
*/

const STAGES = [
  { key: "applied", label: "Applied", color: "#A1A1AA", bgColor: "#3A3A40", borderColor: "#52525B" },
  { key: "under review", label: "Under Review", color: "#F59E0B", bgColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)" },
  { key: "shortlisted", label: "Shortlisted", color: "#3B82F6", bgColor: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.3)" },
  { key: "interview_scheduled", label: "Interview", color: "#F97316", bgColor: "rgba(249,115,22,0.12)", borderColor: "rgba(249,115,22,0.3)" },
  { key: "offered", label: "Offered", color: "#22C55E", bgColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" },
  { key: "hired", label: "Hired", color: "#A855F7", bgColor: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.3)" },
];

const REJECTED = { key: "rejected", label: "Rejected", color: "#EF4444", bgColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)" };

function getStageIndex(status) {
  const s = (status || "").toLowerCase();
  const idx = STAGES.findIndex((st) => st.key === s);
  return idx >= 0 ? idx : 0;
}

export default function ApplicationPipeline({ currentStatus, onAdvance, onReject, readOnly = false }) {
  const [loading, setLoading] = useState(null); // which stage button is loading
  const isRejected = (currentStatus || "").toLowerCase() === "rejected";
  const currentIndex = getStageIndex(currentStatus);

  const handleAdvance = async (nextStage) => {
    if (loading) return;
    setLoading(nextStage);
    try {
      await onAdvance(nextStage);
    } catch (err) {
      console.error("Failed to advance:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (loading) return;
    setLoading("rejected");
    try {
      await onReject();
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STAGES.map((stage, idx) => {
        const isCurrent = idx === currentIndex && !isRejected;
        const isCompleted = idx < currentIndex && !isRejected;
        const isNext = idx === currentIndex + 1 && !isRejected;
        const isFuture = idx > currentIndex && !isRejected;
        const isLoading = loading === stage.key;

        return (
          <React.Fragment key={stage.key}>
            {/* Stage Button */}
            <button
              onClick={() => {
                if (readOnly || isLoading) return;
                if (isNext) {
                  handleAdvance(stage.key);
                } else if (isCurrent) {
                  // Allow recruiter to re-set to this stage (no-op for current)
                }
              }}
              disabled={readOnly || isLoading || (isFuture && !isNext) || isCompleted}
              className={`
                flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium 
                transition-all duration-200 whitespace-nowrap
                ${isCompleted ? "cursor-default" : ""}
                ${isCurrent ? `cursor-default border-2 font-semibold` : ""}
                ${isNext && !readOnly ? "cursor-pointer border-2 hover:scale-105" : ""}
                ${isFuture ? "cursor-not-allowed opacity-40" : ""}
                ${isLoading ? "opacity-60 cursor-wait" : ""}
              `}
              style={{
                backgroundColor: isCompleted || isCurrent
                  ? stage.bgColor
                  : isNext && !readOnly
                  ? stage.bgColor
                  : "transparent",
                borderColor: isCompleted || isCurrent || isNext
                  ? stage.borderColor
                  : "transparent",
                borderWidth: (isCompleted || isCurrent || isNext) ? "1px" : "0px",
                color: isCompleted || isCurrent
                  ? stage.color
                  : isNext && !readOnly
                  ? stage.color
                  : "#52525B",
              }}
            >
              {isCompleted && <Check size={12} />}
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{stage.label}</span>
              )}
            </button>

            {/* Arrow or Rejection branch */}
            {idx < STAGES.length - 1 && !isRejected && (
              <ChevronRight
                size={14}
                className={`shrink-0 ${idx < currentIndex ? "text-[#22C55E]" : "text-[#3A3A40]"}`}
              />
            )}
            {/* After Interview stage, show rejection branch */}
            {idx === STAGES.length - 2 && !isRejected && (
              <span className="mx-1 text-[#3A3A40]">/</span>
            )}
          </React.Fragment>
        );
      })}

      {/* Rejected Badge */}
      {!readOnly && (
        <button
          onClick={handleReject}
          disabled={isRejected || !!loading}
          className={`
            flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium
            transition-all duration-200 whitespace-nowrap ml-1
            ${isRejected
              ? "border-2 border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
              : "border border-[#52525B] text-[#52525B] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/5 cursor-pointer"
            }
            ${loading === "rejected" ? "opacity-60" : ""}
          `}
        >
          {loading === "rejected" ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <X size={12} />
              <span>Rejected</span>
            </>
          )}
        </button>
      )}

      {/* Read-only rejected state */}
      {readOnly && isRejected && (
        <span className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border-2 border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] ml-1">
          <X size={12} />
          <span>Rejected</span>
        </span>
      )}
    </div>
  );
}

/* Read-only version for seeker view */
export function ApplicationPipelineReadOnly({ status }) {
  return <ApplicationPipeline currentStatus={status} readOnly={true} />;
}