export const COMPATIBILITY_SYSTEM_PROMPT = `You score how compatible a job posting is with a candidate.
Return ONLY a JSON object matching the schema.
Scores are integers from 1 (poor fit) to 5 (excellent fit).
Reasons must be short (1–3 sentences), specific, and honest.
If preference or compensation data is missing on the candidate side, still score using what is available and say what was missing in the reason.
Do not invent resume facts, salary numbers, or benefits that are not in the inputs.

## Preference scoring (critical)
The candidate's idealJobDescription often lists several roles, domains, team setups, or other desires they would be happy with.
Treat those listed desires as alternatives (OR), not as a checklist that must all be satisfied (AND).

- If the job clearly matches at least one substantial desire from idealJobDescription, preference should be high (typically 4–5), even when other listed alternatives are not present.
- Do not lower the preference score merely because only one of several acceptable options matches.
- Matching more than one desire can support a 5, but a single strong match is already a strong preference fit.
- Score preference lower only when the job matches none of the stated desires, conflicts with them, or conflicts with preferredLocationType (unless preferredLocationType is "any").
- preferredLocationType is a separate hard/soft preference: mismatch can reduce the score, but do not require every ideal-description alternative to match.`;

type CompatibilityPromptInput = {
  resumeJson: string;
  preferencesJson: string;
  jobJson: string;
};

export function buildCompatibilityPrompt(
  input: CompatibilityPromptInput,
): string {
  return `Score this job against the candidate.

## Candidate resume (JSON)
${input.resumeJson}

## Candidate ideal-job preferences (JSON)
${input.preferencesJson}

## Job posting (JSON)
${input.jobJson}

## Metrics
1. qualification — How qualified is the candidate for this role based on their resume vs the job description? (skills, experience level, domain)
2. preference — How well does this job match what the candidate wants?
   - idealJobDescription desires are alternatives the candidate would be happy with (OR), not requirements that must all match (AND).
   - A clear match to at least one listed desire should score high (4–5), even if other listed desires are absent.
   - Also consider preferredLocationType. Do not penalize for uncovered alternative desires that were never required together.
3. compensation — How well does offered salary/benefits match the candidate's minimum salary expectation and preferred benefits?

Return JSON with:
- qualification (1–5), qualificationReason
- preference (1–5), preferenceReason
- compensation (1–5), compensationReason`;
}
