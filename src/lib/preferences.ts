import { db } from "@/lib/db";
import { AspectAnswers } from "@/lib/aspects/types";
import { RepoKey } from "@/lib/repos";

export async function getRepoAnswers(
  projectId: string,
  repoKey: RepoKey
): Promise<Record<string, AspectAnswers>> {
  const rows = await db.aspectPreference.findMany({ where: { projectId, repoKey } });
  const result: Record<string, AspectAnswers> = {};
  for (const row of rows) {
    result[row.aspectKey] = JSON.parse(row.data) as AspectAnswers;
  }
  return result;
}

export async function getAspectAnswers(
  projectId: string,
  repoKey: RepoKey,
  aspectKey: string
): Promise<AspectAnswers> {
  const row = await db.aspectPreference.findUnique({
    where: { projectId_repoKey_aspectKey: { projectId, repoKey, aspectKey } },
  });
  return row ? (JSON.parse(row.data) as AspectAnswers) : {};
}

export async function saveAspectAnswers(
  projectId: string,
  repoKey: RepoKey,
  aspectKey: string,
  answers: AspectAnswers
): Promise<void> {
  const data = JSON.stringify(answers);
  await db.aspectPreference.upsert({
    where: { projectId_repoKey_aspectKey: { projectId, repoKey, aspectKey } },
    create: { projectId, repoKey, aspectKey, data },
    update: { data },
  });
}
