/** Best-effort employer name from job fields when no dedicated company column exists. */
export function guessCompanyName(input: {
  jobTitle?: string;
  body?: string;
  dataDump?: string;
}): string | undefined {
  const title = input.jobTitle?.trim() ?? "";
  const atMatch = title.match(/\bat\s+(.+)$/i);
  if (atMatch?.[1]) {
    const fromTitle = atMatch[1].replace(/\s*[|–—-].*$/, "").trim();
    if (fromTitle) return fromTitle;
  }

  const text = [input.body, input.dataDump].filter(Boolean).join("\n");
  const labeled = text.match(
    /(?:^|\n)\s*(?:company|employer|organization)\s*[:\-–—]\s*(.+)/i,
  );
  if (labeled?.[1]) {
    const value = labeled[1].split(/\n/)[0]?.trim().slice(0, 80);
    if (value) return value;
  }

  return undefined;
}
