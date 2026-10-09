import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireProjectOwner } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  await requireProjectOwner(projectId);

  const firstRepo = await db.repo.findFirst({ where: { projectId }, orderBy: { createdAt: "asc" } });
  redirect(firstRepo ? `/projects/${projectId}/repos/${firstRepo.id}` : `/projects/${projectId}/repos/new`);
}
