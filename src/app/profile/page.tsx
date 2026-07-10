"use client";

import { PDFDownloadLink, PDFViewer, pdf } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import AGUSTIN from "../../../resume_data/agustin";
import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import Resume from "@/components/Resume";
import { EMPTY_PROFILE_BUNDLE } from "@/lib/profileDefaults";
import { JOBS_PATH } from "@/lib/site";
import type { ProfileBundle } from "@/types/profile";

const fieldClassName =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500";
const labelClassName = "mb-1 block text-sm font-medium text-zinc-700";

export default function ProfilePage() {
  const [ready, setReady] = useState(false);
  const document = useMemo(() => <Resume data={AGUSTIN} />, []);
  const fileName = "agustin-manriquez-cruz-resume.pdf";

  const { register } = useForm<ProfileBundle>({
    defaultValues: EMPTY_PROFILE_BUNDLE,
  });

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader
        cta={
          <Button href={JOBS_PATH} variant="primary">
            Jobs
          </Button>
        }
      >
        <Button variant="secondary" type="button" onClick={handlePrint}>
          Print PDF
        </Button>
        {ready ? (
          <PDFDownloadLink document={document} fileName={fileName}>
            {({ loading }) => (
              <span className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
                {loading ? "Preparing…" : "Download PDF"}
              </span>
            )}
          </PDFDownloadLink>
        ) : (
          <span className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-400">
            Download PDF
          </span>
        )}
      </AppHeader>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 sm:p-6">
        <form className="flex w-full flex-col gap-6 lg:max-w-xl lg:shrink-0 lg:overflow-y-auto">
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Contact info
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Basic details shown at the top of your resume.
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className={labelClassName}>
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                className={fieldClassName}
                placeholder="Jane Doe"
                {...register("profile.fullName")}
              />
            </div>

            <div>
              <label htmlFor="headline" className={labelClassName}>
                Headline
              </label>
              <input
                id="headline"
                type="text"
                className={fieldClassName}
                placeholder="Full Stack Web Developer"
                {...register("profile.headline")}
              />
            </div>

            <div>
              <label htmlFor="summary" className={labelClassName}>
                Summary
              </label>
              <textarea
                id="summary"
                rows={4}
                className={fieldClassName}
                placeholder="A short professional summary…"
                {...register("profile.summary")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClassName}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={fieldClassName}
                  placeholder="you@example.com"
                  {...register("profile.email")}
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClassName}>
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={fieldClassName}
                  placeholder="(555) 123-4567"
                  {...register("profile.phone")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label htmlFor="city" className={labelClassName}>
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  className={fieldClassName}
                  placeholder="Austin"
                  {...register("profile.city")}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelClassName}>
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  className={fieldClassName}
                  placeholder="TX"
                  {...register("profile.state")}
                />
              </div>
              <div>
                <label htmlFor="zipcode" className={labelClassName}>
                  Zip code
                </label>
                <input
                  id="zipcode"
                  type="text"
                  className={fieldClassName}
                  placeholder="78701"
                  {...register("profile.zipcode")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="portfolioUrl" className={labelClassName}>
                Portfolio URL
              </label>
              <input
                id="portfolioUrl"
                type="url"
                className={fieldClassName}
                placeholder="https://yoursite.com"
                {...register("profile.portfolioUrl")}
              />
            </div>

            <div>
              <label htmlFor="linkedinUrl" className={labelClassName}>
                LinkedIn URL
              </label>
              <input
                id="linkedinUrl"
                type="url"
                className={fieldClassName}
                placeholder="https://linkedin.com/in/you"
                {...register("profile.linkedinUrl")}
              />
            </div>

            <div>
              <label htmlFor="githubUrl" className={labelClassName}>
                GitHub URL
              </label>
              <input
                id="githubUrl"
                type="url"
                className={fieldClassName}
                placeholder="https://github.com/you"
                {...register("profile.githubUrl")}
              />
            </div>
          </section>
        </form>

        <div className="flex min-h-112 flex-1 justify-center lg:min-h-0">
          {ready ? (
            <PDFViewer
              showToolbar={false}
              className="h-[calc(100vh-5.5rem)] w-full overflow-hidden rounded-md border border-zinc-300 bg-white shadow-sm"
            >
              {document}
            </PDFViewer>
          ) : (
            <div className="flex h-[calc(100vh-5.5rem)] w-full items-center justify-center rounded-md border border-zinc-300 bg-white text-sm text-zinc-500 shadow-sm">
              Loading PDF preview…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
