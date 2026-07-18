import type { UpsertProfileInput } from "@/api/profile";

export type MasterFromDumpMode = "add" | "replace";

export type MasterFromDumpInput = {
  mode: MasterFromDumpMode;
  dataDump: string;
  /**
   * Current master profile. Used for `add` so the model can merge.
   * Preference fields are always preserved from `current` when provided.
   */
  current?: UpsertProfileInput | null;
};
