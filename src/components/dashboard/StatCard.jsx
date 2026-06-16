import React from "react";

const borderColors = [
  "border-t-[#00D4AA]",
  "border-t-[#6366F1]",
  "border-t-[#F59E0B]",
  "border-t-[#10B981]",
];

export const StatCard = ({ title, value, icon: Icon, index = 0, className = "" }) => {
  const borderColor = borderColors[index % borderColors.length];

  return (
    <div
      className={`bg-[#18181b] border border-zinc-800/60 rounded-2xl p-5 border-t-2 ${borderColor} ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <span className="text-3xl font-bold text-white tracking-tight">
            {value}
          </span>
          <span className="text-sm font-medium text-zinc-400">{title}</span>
        </div>

        {/* Icon */}
        {Icon && (
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400 mt-1">
            <Icon width={18} height={18} />
          </div>
        )}
      </div>
    </div>
  );
};