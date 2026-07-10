"use client";

import type { ReactNode } from "react";
import { AiConfigProvider } from "@/context/AiConfigContext";

export default function Providers({ children }: { children: ReactNode }) {
  return <AiConfigProvider>{children}</AiConfigProvider>;
}
