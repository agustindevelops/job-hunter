export const COMPATIBILITY_SYSTEM_PROMPT = `You score how compatible a job posting is with a candidate.
Return ONLY a JSON object matching the schema.
Scores are integers from 1 (poor fit) to 5 (excellent fit).
Reasons must be short (1–3 sentences), specific, and honest.
If preference or compensation data is missing on the candidate side, still score using what is available and say what was missing in the reason.
Do not invent resume facts, salary numbers, or benefits that are not in the inputs.`;

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
2. preference — How well does this job match what the candidate wants (ideal job description + preferred location type)?
3. compensation — How well does offered salary/benefits match the candidate's minimum salary expectation and preferred benefits?

Return JSON with:
- qualification (1–5), qualificationReason
- preference (1–5), preferenceReason
- compensation (1–5), compensationReason`;
}
