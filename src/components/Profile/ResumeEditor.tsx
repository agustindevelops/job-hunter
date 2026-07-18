"use client";

import { PDFViewer, pdf } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { MasterFromDumpMode } from "@/api/application";
import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import DumpMasterModal from "@/components/Profile/DumpMasterModal";
import ProfileForm from "@/components/Profile/ProfileForm";
import ResumeThemeBar from "@/components/Profile/ResumeThemeBar";
import CoverLetter from "@/components/CoverLetter";
import Resume from "@/components/Resume";
import { upsertTheme } from "@/api/profile";
import { db } from "@/db";
import { useAiConfig } from "@/context/AiConfigContext";
import {
  EMPTY_PROFILE_FORM,
  formValuesToProfileBundle,
  type ProfileFormValues,
} from "@/lib/profileForm";
import { normalizeThemeColor } from "@/lib/themeColor";
import { zipStoreFiles } from "@/lib/zipStore";

const PDF_PREVIEW_DEBOUNCE_MS = 3000;

type ViewMode = "edit" | "preview";

function slugForFilename(value: string): string {
  return (
    value
      .trim()
      .replace(/[^\w]+/g, "_")
      .replace(/^_+|_+$/g, "") || "document"
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download before it starts.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function pdfBaseName(fullName: string, companyName?: string): string {
  const name = slugForFilename(fullName || "Resume");
  const company = companyName?.trim()
    ? slugForFilename(companyName)
    : null;
  return company ? `${name}_${company}` : name;
}

export type MasterDumpRequest = {
  mode: MasterFromDumpMode;
  dataDump: string;
  current: ProfileFormValues;
};

type ResumeEditorProps = {
  /** Extra page actions in the toolbar (e.g. Clear resume) */
  toolbarActions?: ReactNode;
  /** Rendered above the form (e.g. job details) */
  beforeForm?: ReactNode;
  loadingLabel?: string;
  load: () => Promise<ProfileFormValues>;
  save: (values: ProfileFormValues) => Promise<ProfileFormValues | void>;
  reloadKey?: string | number;
  /** Employer name for cover letter salutation (job pages). */
  companyName?: string;
  /**
   * When set, shows Add / Replace toolbar actions that dump text into a
   * master profile via AI. Should return form values to apply after success.
   */
  onMasterDump?: (request: MasterDumpRequest) => Promise<ProfileFormValues>;
  /** Show ideal-job preference fields (profile page). */
  showIdealJobPreferences?: boolean;
};

export default function ResumeEditor({
  toolbarActions,
  beforeForm,
  loadingLabel = "Loading resume…",
  load,
  save,
  reloadKey,
  companyName,
  onMasterDump,
  showIdealJobPreferences = false,
}: ResumeEditorProps) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [previewValues, setPreviewValues] =
    useState<ProfileFormValues>(EMPTY_PROFILE_FORM);
  const [dumpMode, setDumpMode] = useState<MasterFromDumpMode | null>(null);
  const { openApiKeyModal } = useAiConfig();

  const loadRef = useRef(load);
  const saveRef = useRef(save);
  const onMasterDumpRef = useRef(onMasterDump);
  loadRef.current = load;
  saveRef.current = save;
  onMasterDumpRef.current = onMasterDump;

  const form = useForm<ProfileFormValues>({
    defaultValues: EMPTY_PROFILE_FORM,
  });
  const { reset, control, getValues, handleSubmit, setValue, watch } = form;
  const watched = useWatch({ control });
  const themeColor = watch("themeColor");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreviewValues(watched as ProfileFormValues);
    }, PDF_PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [watched]);

  async function handleThemeChange(color: string) {
    const next = normalizeThemeColor(color);
    setValue("themeColor", next, { shouldDirty: true });
    setPreviewValues((prev) => ({ ...prev, themeColor: next }));
    try {
      const profile = await db.profiles.toCollection().first();
      if (profile?.id != null) {
        await upsertTheme(profile.id, next);
      }
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save resume theme",
      );
    }
  }

  const bundle = useMemo(
    () => formValuesToProfileBundle(previewValues),
    [previewValues],
  );
  const resumeDocument = useMemo(() => <Resume data={bundle} />, [bundle]);
  const coverLetterDocument = useMemo(
    () => (
      <CoverLetter
        profile={bundle.profile}
        coverLetter={previewValues.coverLetter}
        companyName={companyName}
      />
    ),
    [bundle.profile, previewValues.coverLetter, companyName],
  );

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runLoad() {
      setLoading(true);
      setLoadError(null);
      try {
        const values = await loadRef.current();
        if (cancelled) return;
        reset(values);
        setPreviewValues(values);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Failed to load resume",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void runLoad();
    return () => {
      cancelled = true;
    };
  }, [reset, reloadKey]);

  async function handleSave(values: ProfileFormValues) {
    setSaving(true);
    setSaveError(null);
    try {
      const next = await saveRef.current(values);
      if (next) {
        reset(next);
        setPreviewValues(next);
      }
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save resume",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    const values = getValues();
    const bundle = formValuesToProfileBundle(values);
    const base = pdfBaseName(values.fullName, companyName);

    const [resumeBlob, coverLetterBlob] = await Promise.all([
      pdf(<Resume data={bundle} />).toBlob(),
      pdf(
        <CoverLetter
          profile={bundle.profile}
          coverLetter={values.coverLetter}
          companyName={companyName}
        />,
      ).toBlob(),
    ]);

    // Chrome blocks a second programmatic download after async work; zip
    // both PDFs so one click always delivers resume + cover letter.
    const zip = zipStoreFiles([
      {
        name: `${base}_Resume.pdf`,
        data: await resumeBlob.arrayBuffer(),
      },
      {
        name: `${base}_Cover_Letter.pdf`,
        data: await coverLetterBlob.arrayBuffer(),
      },
    ]);
    downloadBlob(zip, `${base}.zip`);
  }

  function handlePreview() {
    setPreviewValues(getValues());
    setViewMode("preview");
  }

  async function handleMasterDump(dataDump: string) {
    const run = onMasterDumpRef.current;
    if (!run || !dumpMode) return;
    const next = await run({
      mode: dumpMode,
      dataDump,
      current: getValues(),
    });
    reset(next);
    setPreviewValues(next);
    setViewMode("edit");
  }

  const dumpDisabled = loading || !!loadError || saving;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2 sm:px-6">
        <div
          role="tablist"
          aria-label="View mode"
          className="inline-flex rounded-md border border-zinc-300 bg-zinc-100 p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "edit"}
            id="resume-tab-edit"
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              viewMode === "edit"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            onClick={() => setViewMode("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "preview"}
            id="resume-tab-preview"
            disabled={loading || !!loadError}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              viewMode === "preview"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            onClick={handlePreview}
          >
            Preview
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {toolbarActions}
          <Button
            type="button"
            variant="secondary"
            onClick={openApiKeyModal}
          >
            API key
          </Button>
          {onMasterDump ? (
            <>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setDumpMode("add")}
                disabled={dumpDisabled}
              >
                Add
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setDumpMode("replace")}
                disabled={dumpDisabled}
              >
                Replace
              </Button>
            </>
          ) : null}
          <Button
            variant="secondary"
            type="button"
            onClick={() => void handleSubmit(handleSave)()}
            disabled={saving || loading || !!loadError}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => void handleDownload()}
          >
            Download PDFs
          </Button>
        </div>
      </div>

      {loadError ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-6">
          {loadError}
        </div>
      ) : null}

      {saveError ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-6">
          {saveError}
        </div>
      ) : null}

      {viewMode === "preview" ? (
        <div
          role="tabpanel"
          aria-labelledby="resume-tab-preview"
          className="flex flex-1 flex-col gap-4 p-4 sm:p-6"
        >
          <ResumeThemeBar
            value={themeColor ?? ""}
            onChange={(color) => void handleThemeChange(color)}
            disabled={loading || !!loadError}
          />

          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex min-h-0 min-w-0 flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Resume
              </p>
              {ready ? (
                <PDFViewer
                  showToolbar={false}
                  className="h-[calc(100vh-14rem)] w-full overflow-hidden rounded-md border border-zinc-300 bg-white shadow-sm"
                >
                  {resumeDocument}
                </PDFViewer>
              ) : (
                <div className="flex h-[calc(100vh-14rem)] w-full items-center justify-center rounded-md border border-zinc-300 bg-white text-sm text-zinc-500 shadow-sm">
                  Loading PDF preview…
                </div>
              )}
            </div>
            <div className="flex min-h-0 min-w-0 flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Cover letter
              </p>
              {ready ? (
                <PDFViewer
                  showToolbar={false}
                  className="h-[calc(100vh-14rem)] w-full overflow-hidden rounded-md border border-zinc-300 bg-white shadow-sm"
                >
                  {coverLetterDocument}
                </PDFViewer>
              ) : (
                <div className="flex h-[calc(100vh-14rem)] w-full items-center justify-center rounded-md border border-zinc-300 bg-white text-sm text-zinc-500 shadow-sm">
                  Loading PDF preview…
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          role="tabpanel"
          aria-labelledby="resume-tab-edit"
          className="flex flex-1 flex-col gap-4 p-4 sm:p-6"
        >
          {beforeForm}

          {loading ? (
            <div className="flex w-full items-center justify-center py-16 text-sm text-zinc-500">
              {loadingLabel}
            </div>
          ) : loadError ? (
            <div className="flex w-full items-center justify-center py-16 text-sm text-zinc-500">
              Unable to load resume.
            </div>
          ) : (
            <ProfileForm
              form={form}
              onSubmit={handleSave}
              saving={saving}
              showIdealJobPreferences={showIdealJobPreferences}
            />
          )}
        </div>
      )}

      {onMasterDump ? (
        <DumpMasterModal
          open={dumpMode != null}
          mode={dumpMode}
          onClose={() => setDumpMode(null)}
          onSubmit={handleMasterDump}
        />
      ) : null}
    </div>
  );
}
