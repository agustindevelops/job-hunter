import type { BenefitType } from "@/types/db";
import { BENEFIT_TYPES } from "./benefitTypes";
import { db } from "./index";

/** Idempotent: inserts missing benefit types by unique name. */
export async function seedBenefitTypes(): Promise<void> {
  await db.transaction("rw", db.benefitTypes, async () => {
    for (const benefit of BENEFIT_TYPES) {
      const existing = await db.benefitTypes
        .where("name")
        .equals(benefit.name)
        .first();
      if (!existing) {
        const row: BenefitType = {
          name: benefit.name,
          label: benefit.label,
        };
        await db.benefitTypes.add(row);
      }
    }
  });
}
