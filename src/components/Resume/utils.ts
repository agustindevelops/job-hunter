export function formatDate(value?: string | null) {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(
  startDate: string,
  endDate?: string | null,
  current?: boolean,
) {
  const start = formatDate(startDate);
  if (current || endDate == null) return `${start} – Present`;
  return `${start} – ${formatDate(endDate)}`;
}
