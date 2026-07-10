import { readApplicationTree, type ApplicationTree } from "@/api/application/_helpers";
import { db } from "@/db";
import type { Contact, ProfileRow, TargetRole } from "@/types/db";

export type ProfileReadResult = {
  profile: ProfileRow;
  contact: Contact;
  targetRoles: TargetRole[];
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

  return { profile, contact, targetRoles, application };
}
