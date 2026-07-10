import Section from "./Section";

const providers = [
  {
    name: "OpenAI",
    href: "https://platform.openai.com/api-keys",
    note: "Paid API access for GPT models",
  },
  {
    name: "Anthropic",
    href: "https://console.anthropic.com/settings/keys",
    note: "Paid API access for Claude models",
  },
  {
    name: "Google AI Studio",
    href: "https://aistudio.google.com/apikey",
    note: "Gemini models with a free tier",
  },
  {
    name: "Ollama",
    href: "https://ollama.com",
    note: "Free local models on your machine",
  },
] as const;

export default function AiUsage() {
  return (
    <Section>
      <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Bring your own AI access.
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-zinc-700">
        To generate tailored documents, you can connect a supported AI model
        using your own API key. For safety, your key is not saved. You will need
        to enter it again in each browser session when you request an
        AI-generated result.
      </p>

      <h3 className="mt-8 text-lg font-medium text-black">Supported options</h3>
      <ul className="mt-4 space-y-3">
        {providers.map((provider) => (
          <li key={provider.name} className="leading-relaxed text-zinc-700">
            <a
              href={provider.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black underline underline-offset-2 hover:text-zinc-700"
            >
              {provider.name}
            </a>
            <span className="text-zinc-500"> — {provider.note}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-3 text-base leading-relaxed text-zinc-700">
        <p>
          Prefer not to send data to a cloud provider?{" "}
          <a
            href="https://ollama.com/download"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-black underline underline-offset-2 hover:text-zinc-700"
          >
            Install Ollama
          </a>
          , pull a model (for example{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            ollama pull llama3.2
          </code>
          ), and point this app at your local Ollama server—usually{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            http://localhost:11434
          </code>
          . No cloud API key is required for local Ollama use.
        </p>
        <p>
          Setup details live in the{" "}
          <a
            href="https://github.com/ollama/ollama"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-black underline underline-offset-2 hover:text-zinc-700"
          >
            Ollama docs
          </a>
          .
        </p>
      </div>

      <aside
        className="mt-6 rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-700"
        role="note"
      >
        Before connecting a provider, review its pricing and privacy policy.
        You are responsible for any usage costs, and any content you send to an
        AI service is subject to that provider’s terms—not this app’s local
        storage model. Local Ollama keeps generation on your machine, but you
        should still review generated text before submitting applications.
      </aside>
    </Section>
  );
}
