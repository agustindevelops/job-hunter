"use client";

import type { FocusEvent } from "react";
import {
  fieldClassName,
  labelClassName,
} from "@/lib/formStyles";
import { normalizeThemeColor } from "@/lib/themeColor";

type ThemePickerProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  /** Compact bar for above PDF preview. */
  compact?: boolean;
};

export default function ThemePicker({
  value,
  onChange,
  disabled = false,
  compact = false,
}: ThemePickerProps) {
  const color = normalizeThemeColor(value);

  return (
    <div
      className={
        compact
          ? "flex w-full flex-wrap items-end gap-3"
          : "flex flex-wrap items-end gap-4"
      }
    >
      <div>
        <label htmlFor="themeColorPicker" className={labelClassName}>
          Primary color
        </label>
        <input
          id="themeColorPicker"
          type="color"
          value={color}
          disabled={disabled}
          className="mt-1 h-10 w-16 cursor-pointer rounded border border-zinc-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(event) =>
            onChange(normalizeThemeColor(event.target.value))
          }
        />
      </div>
      <div className="min-w-40 flex-1">
        <label htmlFor="themeColor" className={labelClassName}>
          Hex
        </label>
        <input
          id="themeColor"
          type="text"
          className={fieldClassName}
          placeholder="#0F766E"
          spellCheck={false}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            onChange(normalizeThemeColor(event.target.value));
          }}
        />
      </div>
      <div
        className="mb-0.5 h-10 w-10 shrink-0 rounded border border-zinc-200"
        style={{ backgroundColor: color }}
        aria-hidden
      />
    </div>
  );
}
