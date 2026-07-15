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
  const [config, setConfigState] = useState<AiConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const configRef = useRef(config);
  configRef.current = config;

  const pendingRef = useRef<{
    resolve: (config: AiConfig) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const pendingPromiseRef = useRef<Promise<AiConfig> | null>(null);

  const setConfig = useCallback((next: AiConfig) => {
    setConfigState(next);
  }, []);

  const clearConfig = useCallback(() => {
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
    if (configRef.current) {
      return Promise.resolve(configRef.current);
    }

    if (pendingPromiseRef.current) {
      return pendingPromiseRef.current;
    }

    pendingPromiseRef.current = new Promise<AiConfig>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      setModalOpen(true);
    });
    return pendingPromiseRef.current;
  }, []);

  const ensureConfig = useCallback(async () => {
    if (configRef.current) return configRef.current;
    return promptForConfig();
  }, [promptForConfig]);

  useEffect(() => {
    registerAiConfigBridge({
      getConfig: () => configRef.current,
      promptForConfig,
    });
    return () => {
      unregisterAiConfigBridge();
    };
  }, [promptForConfig]);

  function handleModalClose() {
    setModalOpen(false);
    settlePending(null);
  }

  function handleModalSaved(saved: AiConfig) {
    setConfigState(saved);
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
