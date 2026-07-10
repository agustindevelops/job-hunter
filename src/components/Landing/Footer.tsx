import { GITHUB_URL, SITE_NAME } from "@/lib/site";

const footerLinks = [
  { href: GITHUB_URL, label: "GitHub", external: true },
  { href: "#privacy", label: "Privacy", external: false },
  { href: "#about", label: "About", external: false },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-black"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-600 hover:text-black"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
        <p className="text-sm leading-relaxed text-zinc-500">
          This project does not provide legal, employment, or professional career
          advice.
        </p>
        <p className="text-sm text-zinc-500">
          © {year} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
