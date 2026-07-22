import { db } from "@/db";

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** Count of jobs created via Apply since local midnight. */
export async function countJobsAppliedToday(): Promise<number> {
  const start = startOfLocalDay(new Date());
  const end = start + 24 * 60 * 60 * 1000;
  return db.jobs.where("appliedAt").between(start, end, true, false).count();
}
