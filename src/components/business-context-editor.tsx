"use client";

import { useState, useSyncExternalStore } from "react";

const MODELS = [
  { value: "claude-sonnet-5", label: "Claude Sonnet 5" },
  { value: "claude-opus-5", label: "Claude Opus 5" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
];

const API_KEY_STORAGE_KEY = "agents-md-builder:anthropic-api-key";

// localStorage is a browser-only external store, so it's read via
// useSyncExternalStore (not useState+useEffect) — gives a safe "" during SSR
// with no hydration mismatch once the client reads the real value.
const apiKeyListeners = new Set<() => void>();

function subscribeToApiKey(callback: () => void) {
  apiKeyListeners.add(callback);
  return () => apiKeyListeners.delete(callback);
}

function getApiKeySnapshot(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getApiKeyServerSnapshot(): string {
  return "";
}

function writeApiKey(value: string) {
  try {
    if (value) localStorage.setItem(API_KEY_STORAGE_KEY, value);
    else localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    // ignore — storage may be unavailable (private browsing, etc.)
  }
  apiKeyListeners.forEach((listener) => listener());
}

export function BusinessContextEditor({
  repoName,
  initialValue,
  stackSummary,
  action,
}: {
  repoName: string;
  initialValue: string;
  stackSummary: string;
  action: (formData: FormData) => void;
}) {
  const apiKey = useSyncExternalStore(subscribeToApiKey, getApiKeySnapshot, getApiKeyServerSnapshot);
  const [model, setModel] = useState(MODELS[0].value);
  const [text, setText] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggest() {
    if (!apiKey) {
      setError("Add your Anthropic API key first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          // Anthropic's documented opt-in for calling the Messages API
          // directly from a browser with a user-supplied key, which is the
          // whole point here — the key and the prompt never pass through
          // our server.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content:
                `You're drafting a short "Business Context" section for an AGENTS.md file that guard-rails AI coding agents working in the "${repoName}" repo.\n\n` +
                `Already-configured stack and conventions:\n${stackSummary}\n\n` +
                (text ? `Current draft to improve:\n${text}\n\n` : "") +
                `Write 3-6 concise bullet points covering the business domain, critical invariants, and any compliance/safety rules an AI agent editing this code should never violate. Output only the bullet points, no preamble.`,
            },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 300)}`);
      }
      const data = await res.json();
      const suggestion = data.content?.[0]?.text;
      if (!suggestion) throw new Error("Anthropic API returned no text content");
      setText(suggestion.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-medium">Business context</h2>
        <p className="text-sm text-slate-500">
          Domain rules and invariants the structured aspects above don&rsquo;t capture &mdash;
          included as its own section in the generated AGENTS.md. Optionally draft it with AI using
          your own Anthropic API key: the key, this text, and the AI&rsquo;s reply all stay in your
          browser and go straight to Anthropic &mdash; none of it passes through our server unless
          you click Save.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1">
          <label htmlFor="anthropic-key" className="block text-xs font-medium text-slate-600">
            Anthropic API key
          </label>
          <input
            id="anthropic-key"
            type="password"
            value={apiKey}
            onChange={(e) => writeApiKey(e.target.value)}
            placeholder="sk-ant-..."
            autoComplete="off"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="anthropic-model" className="block text-xs font-medium text-slate-600">
            Model
          </label>
          <select
            id="anthropic-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={suggest}
          disabled={loading}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Suggest with AI"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <form action={action} className="space-y-3">
        <textarea
          name="businessContext"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="e.g. This service processes refunds — never allow a refund to exceed the original charge amount, and all monetary math must use integer cents, not floats."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Save
        </button>
      </form>
    </div>
  );
}
