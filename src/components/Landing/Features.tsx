import Section from "./Section";

const features = [
  {
    title: "Build your reusable profile",
    description:
      "Save your work experience, education, skills, accomplishments, and other information you regularly use in applications.",
  },
  {
    title: "Save common answers",
    description:
      "Keep reusable answers for questions such as why you are interested in a role, your preferred work environment, or examples of past accomplishments.",
  },
  {
    title: "Tailor each application",
    description:
      "Paste a job posting and use your saved information with an AI model to create a tailored resume and cover letter.",
  },
  {
    title: "Track your applications",
    description:
      "Record where you applied, which resume you used, your current status, and whether you received an interview, offer, or rejection.",
  },
] as const;

export default function Features() {
  return (
    <Section id="how-it-works">
      <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        What You Can Do
      </h2>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature.title}>
            <h3 className="text-lg font-medium text-black">{feature.title}</h3>
            <p className="mt-2 leading-relaxed text-zinc-700">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
