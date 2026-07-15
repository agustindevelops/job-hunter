"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { MasterFromDumpMode } from "@/api/application";
import { isAiConfigCancelledError } from "@/api/ai";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { fieldClassName, labelClassName } from "@/lib/formStyles";

type DumpMasterModalProps = {
  open: boolean;
  mode: MasterFromDumpMode | null;
  onClose: () => void;
  onSubmit: (dataDump: string) => Promise<void>;
};

type DumpFormValues = {
  dataDump: string;
};

const MODE_COPY: Record<
  MasterFromDumpMode,
  { title: string; description: string; submit: string }
> = {
  add: {
    title: "Add from dump",
    description:
      "Paste resume, LinkedIn, or notes. AI merges into your master profile — concise bullets, real facts only, ready to tailor per job.",
    submit: "Add",
  },
  replace: {
    title: "Replace from dump",
    description:
      "Paste resume, LinkedIn, or notes. AI rebuilds your master from this dump only into a strong, scannable starting profile.",
    submit: "Replace",
  },
};

export default function DumpMasterModal({
  open,
  mode,
  onClose,
  onSubmit,
}: DumpMasterModalProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<DumpFormValues>({
    defaultValues: { dataDump: "" },
  });

  const copy = mode ? MODE_COPY[mode] : null;

  async function handleRun(values: DumpFormValues) {
    setRunning(true);
    setError(null);
    try {
      await onSubmit(values.dataDump);
      reset();
      onClose();
    } catch (err) {
      if (isAiConfigCancelledError(err)) {
        onClose();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to process dump");
    } finally {
      setRunning(false);
    }
  }

  function handleClose() {
    if (running) return;
    setError(null);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open && mode != null}
      title={copy?.title ?? "Data dump"}
      onClose={handleClose}
      description={copy?.description}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => void handleRun(values))}
      >
        <div>
          <label htmlFor="masterDataDump" className={labelClassName}>
            Data dump
          </label>
          <textarea
            id="masterDataDump"
            rows={10}
            className={fieldClassName}
            placeholder="Paste LinkedIn export, resume text, or notes…"
            disabled={running}
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
            disabled={running}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={running || !mode}>
            {running ? "Working…" : (copy?.submit ?? "Run")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
