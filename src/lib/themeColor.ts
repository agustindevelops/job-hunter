/** Default resume primary — original resume accent teal. */
export const DEFAULT_THEME_COLOR = "#0F766E";

const HEX6 = /^#([0-9A-Fa-f]{6})$/;
const HEX3 = /^#([0-9A-Fa-f]{3})$/;

/** Normalize a user/theme color to `#RRGGBB`, or fall back to the default. */
export function normalizeThemeColor(value?: string | null): string {
  const trimmed = (value ?? "").trim();
  const six = HEX6.exec(trimmed);
  if (six) return `#${six[1]!.toUpperCase()}`;
  const three = HEX3.exec(trimmed);
  if (three) {
    const [r, g, b] = three[1]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return DEFAULT_THEME_COLOR;
}
