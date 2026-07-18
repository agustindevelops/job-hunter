"use client";

import ThemePicker from "@/components/Profile/ThemePicker";

type ResumeThemeBarProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
};

/** Full-width theme controls above resume + cover letter previews. */
export default function ResumeThemeBar({
  value,
  onChange,
  disabled = false,
}: ResumeThemeBarProps) {
  return (
    <div className="w-full rounded-md border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-900">Resume theme</p>
          <p className="text-xs text-zinc-500">
            Profile-wide accent color for PDF resume links and headings.
          </p>
        </div>
        <p className="text-xs text-zinc-400">Saved to your profile</p>
      </div>
      <ThemePicker
        compact
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
