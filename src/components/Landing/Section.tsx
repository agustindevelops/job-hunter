import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
};

export default function Section({ id, children, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16 ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </section>
  );
}
