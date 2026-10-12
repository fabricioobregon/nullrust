import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Project } from "@/generated/prisma/client";

/** Loads the project or 404s if it doesn't exist. Projects aren't
 * access-controlled — GitHub sign-in is scoped to the one feature that
 * actually needs a GitHub identity (pushing to a repo via
 * actions.ts's pushToGithub), not to using the app at all. See
 * CLAUDE.md's "Users, sessions, and ownership" note for why. */
export async function getProjectOrNotFound(projectId: string): Promise<Project> {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();
  return project;
}
