"use client";

import { masterFromDump } from "@/api/application";
import { readProfile, upsertProfile } from "@/api/profile";
import ResumeEditor, {
  type MasterDumpRequest,
} from "@/components/Profile/ResumeEditor";
import {
  EMPTY_PROFILE_FORM,
  formValuesToUpsertInput,
  readResultToFormValues,
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

  async function handleMasterDump({
    mode,
    dataDump,
    current,
  }: MasterDumpRequest): Promise<ProfileFormValues> {
    const payload = await masterFromDump({
      mode,
      dataDump,
      current: mode === "add" ? formValuesToUpsertInput(current) : null,
    });
    await upsertProfile(payload);
    const result = await readProfile();
    if (!result) {
      throw new Error("Failed to read profile after dump");
    }
    return readResultToFormValues(result);
  }

  return (
    <ResumeEditor
      loadingLabel="Loading profile…"
      load={load}
      save={save}
      onMasterDump={handleMasterDump}
    />
  );
}
