"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
    >
      {copied ? "Copied!" : "Copy to clipboard"}
    </button>
  );
}
