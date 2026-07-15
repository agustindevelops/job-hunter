"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isAiConfigCancelledError } from "@/api/ai";
import { createJobFromApply } from "@/api/job";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { fieldClassName, labelClassName } from "@/lib/formStyles";
import { jobPath } from "@/lib/site";

type ApplyJobModalProps = {
  open: boolean;
  onClose: () => void;
};

type ApplyJobFormValues = {
  url: string;
  dataDump: string;
};

export default function ApplyJobModal({ open, onClose }: ApplyJobModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<ApplyJobFormValues>({
    defaultValues: { url: "", dataDump: "" },
  });

  async function handleApply(values: ApplyJobFormValues) {
    setSaving(true);
    setError(null);
    try {
      const id = await createJobFromApply({
        link: values.url,
        dataDump: values.dataDump,
      });
      reset();
      onClose();
      router.push(jobPath(id));
    } catch (err) {
      if (isAiConfigCancelledError(err)) {
        onClose();
        return;
      }
      setError(
        err instanceof Error ? err.message : "Failed to create job from dump",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setError(null);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Apply for Job"
      onClose={handleClose}
      description="Paste the posting URL and raw job text. AI will match fields to the job schema; the original dump is kept for safekeeping."
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(handleApply)}
      >
        <div>
          <label htmlFor="jobUrl" className={labelClassName}>
            URL
          </label>
          <input
            id="jobUrl"
            type="url"
            className={fieldClassName}
            placeholder="https://…"
            disabled={saving}
            {...register("url", { required: true })}
          />
        </div>
        <div>
          <label htmlFor="dataDump" className={labelClassName}>
            Data dump
          </label>
          <textarea
            id="dataDump"
            rows={8}
            className={fieldClassName}
            placeholder="Paste the full job description or scraped posting text…"
            disabled={saving}
            {...register("dataDump", { required: true })}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Matching…" : "Continue"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
