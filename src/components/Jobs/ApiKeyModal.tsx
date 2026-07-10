"use client";

import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useAiConfig } from "@/context/AiConfigContext";
import {
  AI_MODELS,
  getDefaultModelOption,
  getModelOption,
} from "@/lib/aiModels";
import { fieldClassName, labelClassName } from "@/lib/formStyles";
import type { AiConfig } from "@/types/ai";

type ApiKeyModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a new key is saved (not when deleting). */
  onSaved?: () => void;
};

type ApiKeyFormValues = AiConfig;

function maskApiKey(key: string) {
  if (key.length <= 4) return "••••";
  return `••••••••••••${key.slice(-4)}`;
}

const defaultModel = getDefaultModelOption();

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

  function handleModelChange(modelId: string) {
    const option = getModelOption(modelId);
    if (!option) return;
    setValue("model", option.id);
    setValue("provider", option.provider);
    setValue("baseUrl", option.baseUrl);
  }

  function handleSave(values: ApiKeyFormValues) {
    const option = getModelOption(values.model) ?? defaultModel;
    const trimmed: AiConfig = {
      apiKey: values.apiKey.trim(),
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
    onSaved?.();
  }

  function handleDelete() {
    clearConfig();
    reset({
      apiKey: "",
      model: defaultModel.id,
      provider: defaultModel.provider,
      baseUrl: defaultModel.baseUrl,
    });
  }

  const savedLabel =
    config &&
    (getModelOption(config.model)?.label ?? config.model);

  return (
    <Modal
      open={open}
      title="API key"
      onClose={onClose}
      description={
        <>
          Your API key, model, and endpoint are kept only in this browser tab’s
          memory. They are never written to a server, disk, or IndexedDB. Closing
          or refreshing the page clears them so a leaked backup or shared device
          cannot expose your credentials.
        </>
      }
    >
      {config ? (
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="savedApiKey" className={labelClassName}>
              API key
            </label>
            <input
              id="savedApiKey"
              type="text"
              readOnly
              value={maskApiKey(config.apiKey)}
              className={`${fieldClassName} bg-zinc-50 font-mono tracking-wider text-zinc-600`}
              aria-label="Saved API key (hidden)"
            />
          </div>
          <div>
            <label className={labelClassName}>Model</label>
            <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              {savedLabel}
            </p>
          </div>
          <div>
            <label className={labelClassName}>Base URL</label>
            <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm break-all text-zinc-700">
              {config.baseUrl}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="button" variant="secondary" onClick={handleDelete}>
              Delete key
            </Button>
          </div>
        </div>
      ) : (
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
            <input
              id="apiKey"
              type="password"
              autoComplete="off"
              className={fieldClassName}
              placeholder={selectedOption.keyHint}
              {...register("apiKey", { required: true })}
            />
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
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
