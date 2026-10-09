import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "./session";
import { User, Project } from "@/generated/prisma/client";

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

/** Loads the project and verifies the current user owns it — 404s rather
 * than redirecting on a mismatch, so a signed-in user poking at another
 * user's project id learns nothing about whether that id exists. */
export async function requireProjectOwner(projectId: string): Promise<{ user: User; project: Project }> {
  const user = await requireUser();
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id) notFound();
  return { user, project };
}
