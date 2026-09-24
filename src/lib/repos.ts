export type RepoKey = "infra" | "backend" | "frontend" | "mobile";

export type RepoDefinition = {
  key: RepoKey;
  title: string;
  icon: string;
};

// Default repo split for a project. Hardcoded for now, matching the
// aspect-registry pattern — customizable-per-project repos are future scope.
export const repos: RepoDefinition[] = [
  { key: "infra", title: "Infra", icon: "🏗️" },
  { key: "backend", title: "Backend", icon: "🧠" },
  { key: "frontend", title: "Frontend", icon: "🖥️" },
  { key: "mobile", title: "Mobile", icon: "📱" },
];

export function getRepo(key: string): RepoDefinition | undefined {
  return repos.find((r) => r.key === key);
}

export function isRepoKey(key: string): key is RepoKey {
  return repos.some((r) => r.key === key);
}
