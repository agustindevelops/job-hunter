"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AiConfig } from "@/types/ai";

type AiConfigContextValue = {
  config: AiConfig | null;
  setConfig: (config: AiConfig) => void;
  clearConfig: () => void;
};

const AiConfigContext = createContext<AiConfigContextValue | null>(null);

export function AiConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AiConfig | null>(null);

  const setConfig = useCallback((next: AiConfig) => {
    setConfigState(next);
  }, []);

  const clearConfig = useCallback(() => {
    setConfigState(null);
  }, []);

  const value = useMemo(
    () => ({ config, setConfig, clearConfig }),
    [config, setConfig, clearConfig],
  );

  return (
    <AiConfigContext.Provider value={value}>{children}</AiConfigContext.Provider>
  );
}

export function useAiConfig() {
  const ctx = useContext(AiConfigContext);
  if (!ctx) {
    throw new Error("useAiConfig must be used within AiConfigProvider");
  }
  return ctx;
}
