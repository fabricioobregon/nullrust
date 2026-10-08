import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const firstRepo = await db.repo.findFirst({ where: { projectId }, orderBy: { createdAt: "asc" } });
  redirect(firstRepo ? `/projects/${projectId}/repos/${firstRepo.id}` : `/projects/${projectId}/repos/new`);
}
