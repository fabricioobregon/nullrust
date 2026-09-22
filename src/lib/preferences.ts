import { db } from "@/lib/db";
import { AspectAnswers } from "@/lib/aspects/types";

export async function getProjectAnswers(
  projectId: string
): Promise<Record<string, AspectAnswers>> {
  const rows = await db.aspectPreference.findMany({ where: { projectId } });
  const result: Record<string, AspectAnswers> = {};
  for (const row of rows) {
    result[row.aspectKey] = JSON.parse(row.data) as AspectAnswers;
  }
  return result;
}

export async function getAspectAnswers(
  projectId: string,
  aspectKey: string
): Promise<AspectAnswers> {
  const row = await db.aspectPreference.findUnique({
    where: { projectId_aspectKey: { projectId, aspectKey } },
  });
  return row ? (JSON.parse(row.data) as AspectAnswers) : {};
}

export async function saveAspectAnswers(
  projectId: string,
  aspectKey: string,
  answers: AspectAnswers
): Promise<void> {
  const data = JSON.stringify(answers);
  await db.aspectPreference.upsert({
    where: { projectId_aspectKey: { projectId, aspectKey } },
    create: { projectId, aspectKey, data },
    update: { data },
  });
}
