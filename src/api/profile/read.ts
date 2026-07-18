import { readApplicationTree, type ApplicationTree } from "@/api/application/_helpers";
import { db } from "@/db";
import type { BenefitType, Contact, ProfileRow, TargetRole } from "@/types/db";

export type ProfileReadResult = {
  profile: ProfileRow;
  contact: Contact;
  targetRoles: TargetRole[];
  preferredBenefits: BenefitType[];
  application: ApplicationTree;
};

/** Reads the single local profile with contact, target roles, and master application tree. */
export async function readProfile(): Promise<ProfileReadResult | null> {
  const profile = await db.profiles.toCollection().first();
  if (!profile?.id || profile.applicationId == null) return null;

  const contact = await db.contacts.get(profile.contactId);
  if (!contact) return null;

  const application = await readApplicationTree(profile.applicationId);
  if (!application) return null;

  const targetRoles = await db.targetRoles
    .where("profileId")
    .equals(profile.id)
    .toArray();

  const benefitLinks = await db.profileBenefits
    .where("profileId")
    .equals(profile.id)
    .toArray();
  const preferredBenefits = (
    await db.benefitTypes.bulkGet(
      benefitLinks.map((row) => row.benefitTypeId),
    )
  ).filter((b): b is BenefitType => b != null);

  return { profile, contact, targetRoles, preferredBenefits, application };
}
