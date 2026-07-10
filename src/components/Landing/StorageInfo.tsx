import Section from "./Section";

const points = [
  "Your information is not automatically uploaded to a central user database.",
  "Your information will only be available in the browser and device where you created it.",
  "Switching browsers or devices will create a separate local workspace.",
  "Clearing your browser’s site data may permanently remove your saved information.",
  "You should regularly export a backup of information you do not want to lose.",
] as const;

export default function StorageInfo() {
  return (
    <Section id="privacy">
      <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Your information stays in your browser.
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-zinc-700">
        This app does not require an account. Your profile, saved answers,
        resumes, cover letters, and application history are stored locally in
        your browser using IndexedDB.
      </p>
      <p className="mt-6 font-medium text-black">This means:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-zinc-700">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </Section>
  );
}
