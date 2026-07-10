"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { createJobFromApply } from "@/db/jobs";
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
  const { register, handleSubmit, reset } = useForm<ApplyJobFormValues>({
    defaultValues: { url: "", dataDump: "" },
  });

  async function handleApply(values: ApplyJobFormValues) {
    setSaving(true);
    try {
      const id = await createJobFromApply({
        link: values.url,
        dataDump: values.dataDump,
      });
      reset();
      onClose();
      router.push(jobPath(id));
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Apply for Job"
      onClose={handleClose}
      description="Paste the posting URL and any raw job text you want the AI to use."
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
            {saving ? "Saving…" : "Continue"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
