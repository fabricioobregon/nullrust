export type RepoKind = "infra" | "backend" | "frontend" | "mobile" | "other";

export type RepoKindDefinition = {
  key: RepoKind;
  title: string;
  icon: string;
  description: string;
};

// The closed set of kinds a repo can be classified as. This drives which
// aspects/options apply (see aspectsForRepo, compatibleOptions) — it is not
// a list of actual repos anymore; repos themselves are user-created rows
// under a project (see the Repo model), each tagged with one of these kinds.
export const repoKinds: RepoKindDefinition[] = [
  { key: "infra", title: "Infra", icon: "🏗️", description: "Terraform, Kubernetes, CI/CD, deployment config." },
  { key: "backend", title: "Backend", icon: "🧠", description: "APIs, services, databases, background jobs." },
  { key: "frontend", title: "Frontend", icon: "🖥️", description: "Web UI, client-side apps." },
  { key: "mobile", title: "Mobile", icon: "📱", description: "iOS, Android, cross-platform apps." },
  { key: "other", title: "Other", icon: "📦", description: "Anything that doesn't fit the categories above." },
];

export function getRepoKind(key: string): RepoKindDefinition | undefined {
  return repoKinds.find((r) => r.key === key);
}

export function isRepoKind(key: string): key is RepoKind {
  return repoKinds.some((r) => r.key === key);
}
