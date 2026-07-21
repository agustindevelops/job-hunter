"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useAiConfig } from "@/context/AiConfigContext";
import {
  AI_MODELS,
  getModelOption,
} from "@/lib/aiModels";
import { getStartingModelOption } from "@/lib/aiEnvConfig";
import { fieldClassName, labelClassName } from "@/lib/formStyles";
import { API_KEYS_GUIDE_PATH } from "@/lib/site";
import type { AiConfig } from "@/types/ai";

type ApiKeyModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a new key is saved (not when deleting). */
  onSaved?: (config: AiConfig) => void;
};

type ApiKeyFormValues = AiConfig;

function maskApiKey(key: string) {
  if (key.length <= 4) return "••••";
  return `••••••••••••${key.slice(-4)}`;
}

const defaultModel = getStartingModelOption();

export default function ApiKeyModal({
  open,
  onClose,
  onSaved,
}: ApiKeyModalProps) {
  const { config, setConfig, clearConfig } = useAiConfig();
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ApiKeyFormValues>({
      defaultValues: {
        apiKey: "",
        model: defaultModel.id,
        provider: defaultModel.provider,
        baseUrl: defaultModel.baseUrl,
      },
    });

  const selectedModelId = watch("model");
  const selectedOption = getModelOption(selectedModelId) ?? defaultModel;
  const keyLocked = !!config;

  useEffect(() => {
    if (!open) return;
    const starting = getStartingModelOption();
    const option = config
      ? (getModelOption(config.model) ?? {
          id: config.model,
          provider: config.provider,
          baseUrl: config.baseUrl,
        })
      : starting;
    reset({
      apiKey: "",
      model: option.id,
      provider: option.provider,
      baseUrl: config?.baseUrl ?? option.baseUrl,
    });
  }, [open, config, reset]);

  function handleModelChange(modelId: string) {
    const option = getModelOption(modelId);
    if (!option) return;
    setValue("model", option.id);
    setValue("provider", option.provider);
    setValue("baseUrl", option.baseUrl);
  }

  function handleSave(values: ApiKeyFormValues) {
    const option = getModelOption(values.model) ?? defaultModel;
    const apiKey = (config?.apiKey ?? values.apiKey).trim();
    const trimmed: AiConfig = {
      apiKey,
      model: option.id,
      provider: option.provider,
      baseUrl: values.baseUrl.trim().replace(/\/$/, "") || option.baseUrl,
    };
    if (!trimmed.apiKey || !trimmed.model || !trimmed.baseUrl) return;
    setConfig(trimmed);
    reset({
      apiKey: "",
      model: trimmed.model,
      provider: trimmed.provider,
      baseUrl: trimmed.baseUrl,
    });
    onSaved?.(trimmed);
  }

  function handleDelete() {
    const option = getModelOption(selectedModelId) ?? defaultModel;
    clearConfig();
    reset({
      apiKey: "",
      model: option.id,
      provider: option.provider,
      baseUrl: option.baseUrl,
    });
  }

  return (
    <Modal
      open={open}
      title="API key"
      onClose={onClose}
      description={
        <>
          <p>
            Your API key, model, and endpoint are kept only in this browser
            tab’s memory. They are never written to IndexedDB. Closing or
            refreshing the page clears session overrides. For local
            development you can seed defaults with{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em]">
              NEXT_PUBLIC_AI_API_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em]">
              NEXT_PUBLIC_AI_MODEL
            </code>{" "}
            in{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em]">
              .env.local
            </code>
            .
          </p>
          <p className="mt-2">
            <Link
              href={API_KEYS_GUIDE_PATH}
              className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
              onClick={onClose}
            >
              More info
            </Link>
            <span className="text-zinc-400">
              {" "}
              — how we keep keys temporary, where to get one, and pricing.
            </span>
          </p>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(handleSave)}
      >
        <div>
          <label htmlFor="model" className={labelClassName}>
            Model
          </label>
          <select
            id="model"
            className={fieldClassName}
            value={selectedModelId}
            onChange={(event) => handleModelChange(event.target.value)}
          >
            {AI_MODELS.some((option) => option.id === selectedModelId) ? null : (
              <option value={selectedModelId}>{selectedModelId}</option>
            )}
            {AI_MODELS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="apiKey" className={labelClassName}>
            API key
          </label>
          {keyLocked ? (
            <>
              <input
                id="apiKey"
                type="text"
                disabled
                value={maskApiKey(config?.apiKey ?? "")}
                className={`${fieldClassName} bg-zinc-50 font-mono tracking-wider text-zinc-600 disabled:cursor-not-allowed`}
                aria-label="Saved API key (hidden)"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Key is locked. Delete it to enter a different one. You can still
                change the model above.
              </p>
            </>
          ) : (
            <input
              id="apiKey"
              type="password"
              autoComplete="off"
              className={fieldClassName}
              placeholder={selectedOption.keyHint}
              {...register("apiKey", { required: !keyLocked })}
            />
          )}
        </div>

        <div>
          <label htmlFor="baseUrl" className={labelClassName}>
            Base URL
          </label>
          <input
            id="baseUrl"
            type="url"
            className={fieldClassName}
            {...register("baseUrl", { required: true })}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Fills in from the model you pick. Override for a proxy or custom
            local endpoint (Ollama defaults to{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5">
              http://localhost:11434/v1
            </code>
            ).
          </p>
        </div>

        <input type="hidden" {...register("provider")} />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {keyLocked ? "Close" : "Cancel"}
          </Button>
          {keyLocked ? (
            <Button type="button" variant="secondary" onClick={handleDelete}>
              Delete key
            </Button>
          ) : null}
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
