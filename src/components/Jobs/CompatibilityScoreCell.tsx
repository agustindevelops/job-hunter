"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Job } from "@/types/db";

type CompatibilityScoreCellProps = {
  job: Job;
};

const TOOLTIP_WIDTH = 480;

function formatScore(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Red (1) → amber (3) → green (5). */
function scoreColorClass(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(score)) return "text-zinc-400";
  if (score < 2) return "text-red-600";
  if (score < 3) return "text-orange-500";
  if (score < 4) return "text-amber-500";
  if (score < 4.5) return "text-lime-600";
  return "text-green-600";
}

type TooltipPos = {
  top: number;
  left: number;
  /** Covers the score button so hover includes the trigger itself. */
  coverHeight: number;
};

export default function CompatibilityScoreCell({
  job,
}: CompatibilityScoreCellProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const [mounted, setMounted] = useState(false);

  const average = job.compatibilityScore;
  const hasBreakdown =
    job.compatibilityQualification != null ||
    job.compatibilityPreference != null ||
    job.compatibilityCompensation != null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const margin = 8;
      let left = rect.left;
      if (left + TOOLTIP_WIDTH > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - TOOLTIP_WIDTH - margin);
      }
      setPos({
        top: rect.top,
        left,
        coverHeight: rect.height,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  function openNow() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }

  function scheduleClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 120);
  }

  if (average == null && !hasBreakdown) {
    return <span className="text-zinc-400">—</span>;
  }

  const rows = [
    {
      label: "Qualification",
      score: job.compatibilityQualification,
      reason: job.compatibilityQualificationReason?.trim() || "—",
    },
    {
      label: "Preference",
      score: job.compatibilityPreference,
      reason: job.compatibilityPreferenceReason?.trim() || "—",
    },
    {
      label: "Compensation",
      score: job.compatibilityCompensation,
      reason: job.compatibilityCompensationReason?.trim() || "—",
    },
  ];

  const tooltip =
    mounted && open && pos
      ? createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="fixed z-50 text-left"
            style={{
              top: pos.top,
              left: pos.left,
              width: TOOLTIP_WIDTH,
            }}
            onMouseEnter={openNow}
            onMouseLeave={scheduleClose}
          >
            {/* Invisible cover over the score so the hover zone includes it */}
            <div
              className="w-full"
              style={{ height: pos.coverHeight }}
              aria-hidden
            />
            <div className="rounded-md border border-zinc-200 bg-white p-3 shadow-lg">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-500">
                    <th className="w-28 px-2 py-1.5 text-left font-medium">
                      Metric
                    </th>
                    <th className="w-14 px-2 py-1.5 text-left font-medium">
                      Score
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.label}
                      className="align-top border-b border-zinc-50 last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-2 py-2 font-medium text-zinc-800">
                        {row.label}
                      </td>
                      <td
                        className={`whitespace-nowrap px-2 py-2 font-semibold ${scoreColorClass(row.score)}`}
                      >
                        {row.score != null ? `${row.score}/5` : "—"}
                      </td>
                      <td className="px-2 py-2 leading-snug text-zinc-600">
                        {row.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`-m-1 rounded px-2 py-1 font-semibold underline decoration-zinc-300 underline-offset-2 outline-none hover:decoration-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400 ${scoreColorClass(average)}`}
        aria-label={`Compatibility ${formatScore(average)} out of 5. Hover or focus for breakdown.`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
        onFocus={openNow}
        onBlur={scheduleClose}
      >
        {formatScore(average)}
      </button>
      {tooltip}
    </>
  );
}
