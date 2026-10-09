"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveAspectAnswers } from "@/lib/preferences";
import { getAspect, isAspectInRepoScope } from "@/lib/aspects/registry";
import { cleanupIncompatibleAnswers } from "@/lib/aspects/cleanup";
import { AspectAnswers } from "@/lib/aspects/types";
import { isRepoKind } from "@/lib/repos";
import { requireUser } from "@/lib/auth/guards";
import { decrypt } from "@/lib/auth/crypto";
import { getRepoAnswers } from "@/lib/preferences";
import { generateAgentsMd } from "@/lib/generate-agents-md";
import { pushAgentsMdToGithub } from "@/lib/github-push";

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const project = await db.project.create({ data: { name, ownerId: user.id } });
  redirect(`/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id) throw new Error(`Unknown project: ${projectId}`);

  await db.project.delete({ where: { id: projectId } });
  revalidatePath("/");
  redirect("/");
}

export async function createRepo(projectId: string, formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  if (!name) throw new Error("Repo name is required");
  if (!isRepoKind(kind)) throw new Error(`Unknown repo kind: ${kind}`);

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id) throw new Error(`Unknown project: ${projectId}`);

  const repo = await db.repo.create({ data: { projectId, name, kind } });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/repos/${repo.id}`);
}

export async function saveAspect(repoId: string, aspectKey: string, formData: FormData) {
  const user = await requireUser();
  const repo = await db.repo.findUnique({ where: { id: repoId }, include: { project: true } });
  if (!repo || !isRepoKind(repo.kind) || repo.project.ownerId !== user.id) {
    throw new Error(`Unknown repo: ${repoId}`);
  }

  const aspect = await getAspect(aspectKey);
  if (!aspect) throw new Error(`Unknown aspect: ${aspectKey}`);
  if (!isAspectInRepoScope(aspect, repo.kind)) {
    throw new Error(`Aspect "${aspectKey}" is not in scope for repo kind "${repo.kind}"`);
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

  await saveAspectAnswers(repo.projectId, repoId, aspectKey, answers);

  // This save may have made some other, already-saved field's value
  // incompatible (e.g. changing Language away from Python strands a saved
  // Framework = Django) — clear those out instead of leaving stale,
  // no-longer-valid selections sitting in the database.
  const cleared = await cleanupIncompatibleAnswers(repo.projectId, repoId, repo.kind);

  revalidatePath(`/projects/${repo.projectId}/repos/${repoId}`);
  revalidatePath(`/projects/${repo.projectId}/repos/${repoId}/aspects/${aspectKey}`);

  const params = new URLSearchParams({ saved: aspectKey });
  if (cleared.length > 0) {
    params.set(
      "cleared",
      cleared.map((c) => `${c.aspectTitle} → ${c.fieldLabel}: ${c.clearedLabels.join(", ")}`).join("; ")
    );
  }
  redirect(`/projects/${repo.projectId}/repos/${repoId}?${params.toString()}`);
}

export async function setGithubRepo(repoId: string, formData: FormData) {
  const user = await requireUser();
  const repo = await db.repo.findUnique({ where: { id: repoId }, include: { project: true } });
  if (!repo || repo.project.ownerId !== user.id) throw new Error(`Unknown repo: ${repoId}`);

  const raw = String(formData.get("githubRepoFullName") ?? "").trim();
  if (raw && !/^[^/\s]+\/[^/\s]+$/.test(raw)) {
    throw new Error('GitHub repo must be in "owner/repo" form');
  }

  await db.repo.update({ where: { id: repoId }, data: { githubRepoFullName: raw || null } });
  revalidatePath(`/projects/${repo.projectId}/repos/${repoId}/generate`);
}

export async function pushToGithub(repoId: string) {
  const user = await requireUser();
  const repo = await db.repo.findUnique({ where: { id: repoId }, include: { project: true } });
  if (!repo || !isRepoKind(repo.kind) || repo.project.ownerId !== user.id) {
    throw new Error(`Unknown repo: ${repoId}`);
  }

  const generatePath = `/projects/${repo.projectId}/repos/${repoId}/generate`;
  if (!repo.githubRepoFullName) {
    redirect(`${generatePath}?pushError=${encodeURIComponent("Set a GitHub repo below before pushing.")}`);
  }

  const answers = await getRepoAnswers(repoId);
  const markdown = await generateAgentsMd(repo.name, repo.kind, answers);
  const accessToken = decrypt(user.encryptedGithubToken);

  // redirect() throws to work, so it must run after (not inside) this
  // try/catch — otherwise a successful push's own redirect would be
  // swallowed by the catch below and reported as a failure.
  let query: string;
  try {
    const { prUrl } = await pushAgentsMdToGithub({
      accessToken,
      repoFullName: repo.githubRepoFullName,
      content: markdown,
    });
    query = `prUrl=${encodeURIComponent(prUrl)}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    query = `pushError=${encodeURIComponent(message)}`;
  }
  redirect(`${generatePath}?${query}`);
}
