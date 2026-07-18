import { db } from "@/db";
import { DEFAULT_THEME_COLOR, normalizeThemeColor } from "@/lib/themeColor";
import type { Theme } from "@/types/db";

/** Read the theme for a profile (creates none — returns default color if missing). */
export async function readTheme(profileId: number): Promise<Theme | null> {
  return (
    (await db.themes.where("profileId").equals(profileId).first()) ?? null
  );
}

export async function themeColorForProfile(profileId: number): Promise<string> {
  const theme = await readTheme(profileId);
  return normalizeThemeColor(theme?.primaryColor ?? DEFAULT_THEME_COLOR);
}

/**
 * Upsert the single theme row for a profile (1:1).
 * Safe to call from profile save or the preview theme picker.
 */
export async function upsertTheme(
  profileId: number,
  primaryColor: string,
): Promise<void> {
  const color = normalizeThemeColor(primaryColor);
  const existing = await db.themes.where("profileId").equals(profileId).first();
  if (existing?.id != null) {
    await db.themes.update(existing.id, { primaryColor: color });
    return;
  }
  await db.themes.add({ profileId, primaryColor: color });
}
