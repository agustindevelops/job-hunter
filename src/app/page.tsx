"use client";

import { PDFDownloadLink, PDFViewer, pdf } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";
import AGUSTIN from "../../resume_data/agustin";
import Resume from "@/components/Resume";

export default function Home() {
  const [ready, setReady] = useState(false);
  const document = useMemo(() => <Resume data={AGUSTIN} />, []);
  const fileName = "agustin-manriquez-cruz-resume.pdf";

  useEffect(() => {
    setReady(true);
  }, []);

  async function handlePrint() {
    const blob = await pdf(document).toBlob();
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    if (!printWindow) return;
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
    });
  }

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
        Loading PDF preview…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900">
            Resume preview
          </h1>
          <p className="text-xs text-zinc-500">{AGUSTIN.profile.fullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Print PDF
          </button>
          <PDFDownloadLink document={document} fileName={fileName}>
            {({ loading }) => (
              <span className="inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700">
                {loading ? "Preparing…" : "Download PDF"}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </header>

      <div className="flex flex-1 justify-center p-4 sm:p-6">
        <PDFViewer
          showToolbar={false}
          className="h-[calc(100vh-5.5rem)] w-full max-w-4xl overflow-hidden rounded-md border border-zinc-300 bg-white shadow-sm"
        >
          {document}
        </PDFViewer>
      </div>
    </div>
  );
}
