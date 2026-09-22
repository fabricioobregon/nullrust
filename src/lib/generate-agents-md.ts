import { aspects } from "@/lib/aspects/registry";
import { AspectAnswers, AspectDefinition, AspectField } from "@/lib/aspects/types";

function optionLabel(field: AspectField, value: string): string {
  return field.options?.find((o) => o.value === value)?.label ?? value;
}

function renderField(field: AspectField, answers: AspectAnswers): string | null {
  const raw = answers[field.id];
  if (raw === undefined || raw === null || raw === "" || (Array.isArray(raw) && raw.length === 0)) {
    return null;
  }

  if (field.type === "multi" && Array.isArray(raw)) {
    const labels = raw.map((v) => optionLabel(field, v));
    return `- **${field.label}:** ${labels.join(", ")}`;
  }

  if (field.type === "text") {
    return `- **${field.label}:** ${raw}`;
  }

  return `- **${field.label}:** ${optionLabel(field, raw as string)}`;
}

function renderAspect(aspect: AspectDefinition, answers: AspectAnswers): string | null {
  const lines: string[] = [];

  for (const card of aspect.cards) {
    const fieldLines = card.fields
      .map((f) => renderField(f, answers))
      .filter((l): l is string => l !== null);
    if (fieldLines.length === 0) continue;
    lines.push(...fieldLines);
  }

  if (lines.length === 0) return null;

  return [`## ${aspect.icon} ${aspect.title}`, "", ...lines].join("\n");
}

export function generateAgentsMd(
  projectName: string,
  answersByAspect: Record<string, AspectAnswers>
): string {
  const sections = aspects
    .map((aspect) => renderAspect(aspect, answersByAspect[aspect.key] ?? {}))
    .filter((s): s is string => s !== null);

  const header = [
    `# AGENTS.md — ${projectName}`,
    "",
    "This file was generated to guard-rail AI coding agents (and human contributors) working in this repository. It records the stack, conventions, and patterns this project has standardized on. Follow these choices unless a change is deliberately proposed and this file is updated to match.",
  ].join("\n");

  if (sections.length === 0) {
    return [
      header,
      "",
      "_No preferences have been configured yet. Fill in the aspect pages to populate this file._",
    ].join("\n");
  }

  return [header, "", ...sections].join("\n\n");
}
