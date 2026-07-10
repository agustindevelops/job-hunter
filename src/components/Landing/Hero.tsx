import Button from "@/components/Button";
import { PROFILE_PATH } from "@/lib/site";
import Section from "./Section";

export default function Hero() {
  return (
    <Section className="pt-16 sm:pt-24">
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-black sm:text-4xl sm:leading-tight">
        Spend less time rewriting the same job application information.
      </h1>
      <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-zinc-700">
        <p>
          Store your work history, skills, personal details, and answers to
          common application questions in one place. Add a job posting and use
          that information to create tailored resumes and cover letters.
        </p>
        <p>Everything is stored locally in the browser you are currently using.</p>
      </div>
      <div className="mt-8">
        <Button href={PROFILE_PATH}>Create Your Profile</Button>
        <p className="mt-3 text-sm text-zinc-500">
          No account required. Your information is not stored in a central user
          database.
        </p>
      </div>
    </Section>
  );
}
