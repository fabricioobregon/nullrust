import { aspectsForRepo } from "@/lib/aspects/registry";
import { isFieldVisible, RepoAnswers } from "@/lib/aspects/compatibility";
import { AspectAnswers, AspectDefinition, AspectField } from "@/lib/aspects/types";
import { RepoKind } from "@/lib/repos";

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

function renderAspect(aspect: AspectDefinition, repoAnswers: RepoAnswers, repoKind: RepoKind): string | null {
  const lines: string[] = [];
  const answers = repoAnswers[aspect.key] ?? {};

  for (const card of aspect.cards) {
    const fieldLines = card.fields
      // A field hidden by the same hard exclusion the editor uses (e.g.
      // table naming once the engine is a document store) shouldn't leak
      // a stale answer into the generated guardrails either — cleanup.ts
      // clears these on save, but this stays correct even between saves.
      .filter((f) => isFieldVisible(f, repoAnswers, repoKind))
      .map((f) => renderField(f, answers))
      .filter((l): l is string => l !== null);
    if (fieldLines.length === 0) continue;
    lines.push(...fieldLines);
  }

  if (lines.length === 0) return null;

  return [`## ${aspect.icon} ${aspect.title}`, "", ...lines].join("\n");
}

export function generateAgentsMd(
  repoName: string,
  repoKind: RepoKind,
  answersByAspect: Record<string, AspectAnswers>
): string {
  const sections = aspectsForRepo(repoKind)
    .map((aspect) => renderAspect(aspect, answersByAspect, repoKind))
    .filter((s): s is string => s !== null);

  const header = [
    `# AGENTS.md — ${repoName}`,
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
