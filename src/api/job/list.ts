import { db } from "@/db";
import type { Job } from "@/types/db";

/** Lists jobs newest-first for the Jobs Applied To table. */
export async function listJobs(): Promise<Job[]> {
  return db.jobs.orderBy("id").reverse().toArray();
}
