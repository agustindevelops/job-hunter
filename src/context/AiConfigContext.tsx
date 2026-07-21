"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AiConfigCancelledError,
  registerAiConfigBridge,
  unregisterAiConfigBridge,
} from "@/api/ai";
import ApiKeyModal from "@/components/Jobs/ApiKeyModal";
import { getAiConfigFromEnv } from "@/lib/aiEnvConfig";
import type { AiConfig } from "@/types/ai";

type AiConfigContextValue = {
  config: AiConfig | null;
  setConfig: (config: AiConfig) => void;
  clearConfig: () => void;
  /** Opens the API key modal (manage existing key or enter a new one). */
  openApiKeyModal: () => void;
  /**
   * Returns the current config, or opens the modal and waits until the user
   * saves. Rejects with AiConfigCancelledError if they cancel.
   */
  ensureConfig: () => Promise<AiConfig>;
};

const AiConfigContext = createContext<AiConfigContextValue | null>(null);

export function AiConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AiConfig | null>(() =>
    getAiConfigFromEnv(),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const configRef = useRef(config);
  configRef.current = config;
  /** After the user deletes the key, skip env until the next full page load. */
  const envSuppressedRef = useRef(false);

  const pendingRef = useRef<{
    resolve: (config: AiConfig) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const pendingPromiseRef = useRef<Promise<AiConfig> | null>(null);

  const resolveConfig = useCallback((): AiConfig | null => {
    if (configRef.current) return configRef.current;
    if (envSuppressedRef.current) return null;
    return getAiConfigFromEnv();
  }, []);

  const setConfig = useCallback((next: AiConfig) => {
    envSuppressedRef.current = false;
    setConfigState(next);
  }, []);

  const clearConfig = useCallback(() => {
    envSuppressedRef.current = true;
    setConfigState(null);
  }, []);

  const settlePending = useCallback((result: AiConfig | null) => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    pendingPromiseRef.current = null;
    if (result) {
      pending.resolve(result);
    } else {
      pending.reject(new AiConfigCancelledError());
    }
  }, []);

  const openApiKeyModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const promptForConfig = useCallback(() => {
    const existing = resolveConfig();
    if (existing) {
      if (!configRef.current) setConfigState(existing);
      return Promise.resolve(existing);
    }

    if (pendingPromiseRef.current) {
      return pendingPromiseRef.current;
    }

    pendingPromiseRef.current = new Promise<AiConfig>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      setModalOpen(true);
    });
    return pendingPromiseRef.current;
  }, [resolveConfig]);

  const ensureConfig = useCallback(async () => {
    const existing = resolveConfig();
    if (existing) {
      if (!configRef.current) setConfigState(existing);
      return existing;
    }
    return promptForConfig();
  }, [promptForConfig, resolveConfig]);

  useEffect(() => {
    registerAiConfigBridge({
      getConfig: () => resolveConfig(),
      promptForConfig,
    });
    return () => {
      unregisterAiConfigBridge();
    };
  }, [promptForConfig, resolveConfig]);

  function handleModalClose() {
    setModalOpen(false);
    settlePending(null);
  }

  function handleModalSaved(saved: AiConfig) {
    setConfig(saved);
    setModalOpen(false);
    settlePending(saved);
  }

  const value = useMemo(
    () => ({
      config,
      setConfig,
      clearConfig,
      openApiKeyModal,
      ensureConfig,
    }),
    [config, setConfig, clearConfig, openApiKeyModal, ensureConfig],
  );

  return (
    <AiConfigContext.Provider value={value}>
      {children}
      <ApiKeyModal
        open={modalOpen}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
      />
    </AiConfigContext.Provider>
  );
}

export function useAiConfig() {
  const ctx = useContext(AiConfigContext);
  if (!ctx) {
    throw new Error("useAiConfig must be used within AiConfigProvider");
  }
  return ctx;
}
