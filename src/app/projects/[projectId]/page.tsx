import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { repos } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  redirect(`/projects/${projectId}/repos/${repos[0].key}`);
}
