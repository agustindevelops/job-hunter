import { db } from "@/db";

/** Replace job↔benefit join rows from benefit type names. */
export async function syncJobBenefits(
  jobId: number,
  benefitNames: string[],
): Promise<void> {
  await db.jobBenefits.where("jobId").equals(jobId).delete();
  const unique = [...new Set(benefitNames.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return;

  const types = await db.benefitTypes.where("name").anyOf(unique).toArray();
  const byName = new Map(types.map((t) => [t.name, t]));
  for (const name of unique) {
    const benefit = byName.get(name);
    if (!benefit?.id) continue;
    await db.jobBenefits.add({
      jobId,
      benefitTypeId: benefit.id,
    });
  }
}
