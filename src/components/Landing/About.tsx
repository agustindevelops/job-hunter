import Section from "./Section";

export default function About() {
  return (
    <Section id="about">
      <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Built for myself. Shared with other job seekers.
      </h2>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-zinc-700">
        <p>
          I started this project because I was tired of repeatedly entering the
          same information and rewriting my resume for every application. I
          wanted one place where I could organize my experience, reuse my
          answers, tailor my documents, and track the reality of the job
          search—including the rejections.
        </p>
        <p>
          This is a personal, independent project, not a staffing agency or
          employment service. It does not guarantee interviews, job offers, or
          the accuracy of AI-generated content. Users should always review
          generated resumes and cover letters before submitting them.
        </p>
      </div>
    </Section>
  );
}
