import { db } from "@/db";
import { seedBenefitTypes } from "@/db/seed";

/** Wipes IndexedDB entirely, reopens, and reseeds benefit types. */
export async function deleteProfile(): Promise<void> {
  await db.delete();
  await db.open();
  await seedBenefitTypes();
}
