"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { deleteJob } from "@/api/job";

type DeleteJobModalProps = {
  open: boolean;
  jobId: number | null;
  jobTitle: string;
  onClose: () => void;
};

export default function DeleteJobModal({
  open,
  jobId,
  jobTitle,
  onClose,
}: DeleteJobModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (jobId == null) return;
    setDeleting(true);
    try {
      await deleteJob(jobId);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  function handleClose() {
    if (deleting) return;
    onClose();
  }

  const label = jobTitle.trim() || "Untitled";

  return (
    <Modal
      open={open}
      title="Delete job"
      onClose={handleClose}
      description={
        <>
          Remove <span className="font-medium text-zinc-700">{label}</span> from
          your applications? This cannot be undone.
        </>
      }
    >
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
