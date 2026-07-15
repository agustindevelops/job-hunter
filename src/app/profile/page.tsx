"use client";

import { readProfile, upsertProfile } from "@/api/profile";
import ResumeEditor from "@/components/Profile/ResumeEditor";
import {
  EMPTY_PROFILE_FORM,
  readResultToFormValues,
  formValuesToUpsertInput,
  type ProfileFormValues,
} from "@/lib/profileForm";

export default function ProfilePage() {
  async function load(): Promise<ProfileFormValues> {
    const result = await readProfile();
    return result ? readResultToFormValues(result) : EMPTY_PROFILE_FORM;
  }

  async function save(
    values: ProfileFormValues,
  ): Promise<ProfileFormValues | void> {
    await upsertProfile(formValuesToUpsertInput(values));
    const result = await readProfile();
    if (result) return readResultToFormValues(result);
  }

  return (
    <ResumeEditor
      loadingLabel="Loading profile…"
      load={load}
      save={save}
    />
  );
}
