import type { TextItem, ProjectLink } from "@/types/db";
import { createId } from "@/lib/id";

export type { TextItem };

export function createTextItem(text = ""): TextItem {
  return { id: createId(), text };
}

export function createLinkItem(
  label = "",
  url = "",
): ProjectLink {
  return { id: createId(), label, url };
}

/** Accepts legacy string[] or TextItem[] from IndexedDB. */
export function toTextItems(
  values: Array<string | TextItem> | undefined | null,
  { emptyRow = true }: { emptyRow?: boolean } = {},
): TextItem[] {
  if (!values?.length) return emptyRow ? [createTextItem()] : [];
  return values.map((value) => {
    if (typeof value === "string") return createTextItem(value);
    return {
      id: value.id?.trim() ? value.id : createId(),
      text: value.text ?? "",
    };
  });
}

export function cleanTextItems(
  values: TextItem[] | undefined,
): TextItem[] {
  return (values ?? [])
    .map((item) => ({
      id: item.id?.trim() ? item.id : createId(),
      text: item.text.trim(),
    }))
    .filter((item) => item.text.length > 0);
}

export function textItemsToStrings(values: TextItem[] | undefined): string[] {
  return cleanTextItems(values).map((item) => item.text);
}

/** Accepts legacy links without id. */
export function toLinkItems(
  values: Array<{ id?: string; label: string; url: string }> | undefined | null,
  { emptyRow = true }: { emptyRow?: boolean } = {},
): ProjectLink[] {
  if (!values?.length) return emptyRow ? [createLinkItem()] : [];
  return values.map((link) => ({
    id: link.id?.trim() ? link.id : createId(),
    label: link.label ?? "",
    url: link.url ?? "",
  }));
}

export function cleanLinkItems(
  values: ProjectLink[] | undefined,
): ProjectLink[] {
  return (values ?? [])
    .map((link) => ({
      id: link.id?.trim() ? link.id : createId(),
      label: link.label.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => link.label || link.url);
}
