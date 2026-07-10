import {
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";
import { ensureJobApplication } from "@/api/application/ensure";
import { db } from "@/db";

const COVER_LETTER_PLACEHOLDER = `# Cover letter

_Placeholder — AI generation coming soon._
`;

/**
 * Ensures a tailored application exists and sets a markdown cover-letter placeholder.
 */
export async function createCoverLetter(
  jobId: number,
): Promise<ApplicationTree> {
  const applicationId = await ensureJobApplication(jobId);
  await db.applications.update(applicationId, {
    coverLetter: COVER_LETTER_PLACEHOLDER,
  });

  const tree = await readApplicationTree(applicationId);
  if (!tree) throw new Error("Failed to read application after cover letter");
  return tree;
}
