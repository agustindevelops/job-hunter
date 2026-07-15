"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { fieldClassName, labelClassName } from "@/lib/formStyles";
import {
  createLinkItem,
  createTextItem,
  type TextItem,
} from "@/lib/textItem";
import type { ProjectLink } from "@/types/db";

type StringListFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
};

export function StringListField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: StringListFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const values =
          Array.isArray(field.value) && field.value.length > 0
            ? (field.value as TextItem[])
            : [createTextItem()];

        function setAt(index: number, text: string) {
          const next = values.map((item, i) =>
            i === index ? { ...item, text } : item,
          );
          field.onChange(next);
        }

        function removeAt(index: number) {
          if (values.length <= 1) {
            field.onChange([createTextItem()]);
            return;
          }
          field.onChange(values.filter((_, i) => i !== index));
        }

        function addRow() {
          field.onChange([...values, createTextItem()]);
        }

        return (
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className={labelClassName}>{label}</span>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 bg-white text-base leading-none text-zinc-700 hover:bg-zinc-50"
                aria-label={`Add ${label.toLowerCase()}`}
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {values.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    type="text"
                    className={fieldClassName}
                    placeholder={placeholder}
                    value={item.text}
                    onChange={(e) => setAt(index, e.target.value)}
                    onBlur={field.onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    disabled={values.length <= 1 && !item.text}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remove ${label.toLowerCase()} row`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}

type LinkListFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
};

export function LinkListField<T extends FieldValues>({
  control,
  name,
  label = "Links",
}: LinkListFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const values =
          Array.isArray(field.value) && field.value.length > 0
            ? (field.value as ProjectLink[])
            : [createLinkItem()];

        function setAt(
          index: number,
          key: "label" | "url",
          value: string,
        ) {
          const next = values.map((item, i) =>
            i === index ? { ...item, [key]: value } : item,
          );
          field.onChange(next);
        }

        function removeAt(index: number) {
          if (values.length <= 1) {
            field.onChange([createLinkItem()]);
            return;
          }
          field.onChange(values.filter((_, i) => i !== index));
        }

        function addRow() {
          field.onChange([...values, createLinkItem()]);
        }

        return (
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className={labelClassName}>{label}</span>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 bg-white text-base leading-none text-zinc-700 hover:bg-zinc-50"
                aria-label="Add link"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {values.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    type="text"
                    className={fieldClassName}
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => setAt(index, "label", e.target.value)}
                    onBlur={field.onBlur}
                  />
                  <input
                    type="url"
                    className={fieldClassName}
                    placeholder="https://…"
                    value={item.url}
                    onChange={(e) => setAt(index, "url", e.target.value)}
                    onBlur={field.onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    disabled={
                      values.length <= 1 && !item.label && !item.url
                    }
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove link row"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
