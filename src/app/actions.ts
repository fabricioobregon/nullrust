"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveAspectAnswers } from "@/lib/preferences";
import { getAspect, isAspectInRepoScope } from "@/lib/aspects/registry";
import { cleanupIncompatibleAnswers } from "@/lib/aspects/cleanup";
import { AspectAnswers } from "@/lib/aspects/types";
import { RepoKey, isRepoKey } from "@/lib/repos";

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const project = await db.project.create({ data: { name } });
  redirect(`/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  await db.project.delete({ where: { id: projectId } });
  revalidatePath("/");
  redirect("/");
}

export async function saveAspect(
  projectId: string,
  repoKey: RepoKey,
  aspectKey: string,
  formData: FormData
) {
  if (!isRepoKey(repoKey)) throw new Error(`Unknown repo: ${repoKey}`);

  const aspect = getAspect(aspectKey);
  if (!aspect) throw new Error(`Unknown aspect: ${aspectKey}`);
  if (!isAspectInRepoScope(aspect, repoKey)) {
    throw new Error(`Aspect "${aspectKey}" is not in scope for repo "${repoKey}"`);
  }

  const answers: AspectAnswers = {};
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      if (field.type === "multi") {
        const values = formData.getAll(field.id).map(String).filter(Boolean);
        if (values.length > 0) answers[field.id] = values;
      } else {
        const value = String(formData.get(field.id) ?? "").trim();
        if (value) answers[field.id] = value;
      }
    }
  }

  await saveAspectAnswers(projectId, repoKey, aspectKey, answers);

  // This save may have made some other, already-saved field's value
  // incompatible (e.g. changing Language away from Python strands a saved
  // Framework = Django) — clear those out instead of leaving stale,
  // no-longer-valid selections sitting in the database.
  const cleared = await cleanupIncompatibleAnswers(projectId, repoKey);

  revalidatePath(`/projects/${projectId}/repos/${repoKey}`);
  revalidatePath(`/projects/${projectId}/repos/${repoKey}/aspects/${aspectKey}`);

  const params = new URLSearchParams({ saved: aspectKey });
  if (cleared.length > 0) {
    params.set(
      "cleared",
      cleared.map((c) => `${c.aspectTitle} → ${c.fieldLabel}: ${c.clearedLabels.join(", ")}`).join("; ")
    );
  }
  redirect(`/projects/${projectId}/repos/${repoKey}?${params.toString()}`);
}
