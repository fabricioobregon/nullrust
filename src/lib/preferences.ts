import { db } from "@/lib/db";
import { AspectAnswers } from "@/lib/aspects/types";

export async function getRepoAnswers(repoId: string): Promise<Record<string, AspectAnswers>> {
  const rows = await db.aspectPreference.findMany({ where: { repoId } });
  const result: Record<string, AspectAnswers> = {};
  for (const row of rows) {
    result[row.aspectKey] = JSON.parse(row.data) as AspectAnswers;
  }
  return result;
}

export async function saveAspectAnswers(
  projectId: string,
  repoId: string,
  aspectKey: string,
  answers: AspectAnswers
): Promise<void> {
  const data = JSON.stringify(answers);
  await db.aspectPreference.upsert({
    where: { repoId_aspectKey: { repoId, aspectKey } },
    create: { projectId, repoId, aspectKey, data },
    update: { data },
  });
}
