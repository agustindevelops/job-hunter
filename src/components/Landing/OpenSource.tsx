import Button from "@/components/Button";
import { GITHUB_URL } from "@/lib/site";
import Section from "./Section";

export default function OpenSource() {
  return (
    <Section>
      <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Want to improve it?
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-zinc-700">
        This project is open source. Developers, designers, job seekers, and
        anyone with useful ideas are welcome to review the code, report issues,
        or contribute on GitHub.
      </p>
      <div className="mt-6">
        <Button href={GITHUB_URL} variant="secondary" external>
          View on GitHub
        </Button>
      </div>
    </Section>
  );
}
