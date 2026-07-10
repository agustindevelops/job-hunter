import Button from "@/components/Button";
import { PROFILE_PATH } from "@/lib/site";
import Section from "./Section";

export default function FinalCta() {
  return (
    <Section>
      <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Create your reusable job-search workspace.
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-zinc-700">
        Start by adding the information you already use across your applications.
      </p>
      <div className="mt-6">
        <Button href={PROFILE_PATH}>Create Your Profile</Button>
      </div>
    </Section>
  );
}
