import { readApplicationTree, type ApplicationTree } from "@/api/application/_helpers";
import { db } from "@/db";
import { DEFAULT_THEME_COLOR, normalizeThemeColor } from "@/lib/themeColor";
import type { BenefitType, Contact, ProfileRow, TargetRole, Theme } from "@/types/db";

export type ProfileReadResult = {
  profile: ProfileRow;
  contact: Contact;
  targetRoles: TargetRole[];
  preferredBenefits: BenefitType[];
  theme: Theme;
  application: ApplicationTree;
};

/** Reads the single local profile with contact, target roles, theme, and master application tree. */
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

  let theme = await db.themes.where("profileId").equals(profile.id).first();
  if (!theme) {
    const id = await db.themes.add({
      profileId: profile.id,
      primaryColor: DEFAULT_THEME_COLOR,
    });
    theme = {
      id,
      profileId: profile.id,
      primaryColor: DEFAULT_THEME_COLOR,
    };
  } else {
    theme = {
      ...theme,
      primaryColor: normalizeThemeColor(theme.primaryColor),
    };
  }

  return {
    profile,
    contact,
    targetRoles,
    preferredBenefits,
    theme,
    application,
  };
}
