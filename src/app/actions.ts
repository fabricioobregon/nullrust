"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveAspectAnswers } from "@/lib/preferences";
import { getAspect } from "@/lib/aspects/registry";
import { AspectAnswers } from "@/lib/aspects/types";

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
  aspectKey: string,
  formData: FormData
) {
  const aspect = getAspect(aspectKey);
  if (!aspect) throw new Error(`Unknown aspect: ${aspectKey}`);

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

  await saveAspectAnswers(projectId, aspectKey, answers);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/aspects/${aspectKey}`);
  redirect(`/projects/${projectId}?saved=${aspectKey}`);
}
