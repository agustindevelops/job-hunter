import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import { PROFILE_PATH } from "@/lib/site";

type JobPageProps = {
  params: Promise<{
    "job-id": string;
  }>;
};

export default async function JobPage({ params }: JobPageProps) {
  const { "job-id": jobId } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader cta={<Button href={PROFILE_PATH}>Edit profile</Button>} />
      <main className="flex flex-1 p-4 sm:p-6">
        <p className="text-sm text-zinc-500">Job: {jobId}</p>
      </main>
    </div>
  );
}
