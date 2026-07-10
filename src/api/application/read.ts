import {
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";

/** Reads a full application tree (children + tags). */
export async function readApplication(
  applicationId: number,
): Promise<ApplicationTree | null> {
  return readApplicationTree(applicationId);
}
