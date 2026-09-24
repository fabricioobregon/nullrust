import { AspectDefinition } from "./types";

export const packageManagement: AspectDefinition = {
  key: "package-management",
  title: "Package Management",
  icon: "📦",
  tagline: "Package manager, monorepo tooling, and dependency conventions.",
  scope: "all",
  cards: [
    {
      id: "package-manager",
      title: "Package manager",
      fields: [
        {
          id: "manager",
          label: "Package manager",
          type: "single",
          options: [
            { value: "npm", label: "npm" },
            { value: "pnpm", label: "pnpm" },
            { value: "yarn", label: "Yarn (Berry)" },
            { value: "bun", label: "Bun" },
          ],
        },
        {
          id: "enforcement",
          label: "Enforcement",
          type: "multi",
          options: [
            { value: "engines-field", label: "engines field pins Node/package-manager version" },
            { value: "packagemanager-field", label: "packageManager field in package.json (Corepack)" },
            { value: "ci-fails-on-wrong-pm", label: "CI fails if the wrong package manager is used" },
          ],
        },
      ],
    },
    {
      id: "monorepo",
      title: "Monorepo tooling",
      fields: [
        {
          id: "monorepo-tool",
          label: "Monorepo build/task orchestration",
          type: "single",
          options: [
            { value: "none-single-repo", label: "None — single package repo" },
            { value: "turborepo", label: "Turborepo" },
            { value: "nx", label: "Nx" },
            { value: "lerna", label: "Lerna" },
            { value: "native-workspaces", label: "Native workspaces only, no orchestrator" },
          ],
        },
        {
          id: "workspace-conventions",
          label: "Workspace conventions",
          type: "multi",
          options: [
            { value: "shared-tsconfig", label: "Shared base tsconfig/eslint config package" },
            { value: "internal-packages-versioned", label: "Internal packages versioned independently" },
            { value: "internal-packages-unversioned", label: "Internal packages unversioned, always latest via workspace protocol" },
            { value: "remote-caching", label: "Remote build/task caching enabled" },
          ],
        },
      ],
    },
    {
      id: "dependency-conventions",
      title: "Dependency conventions",
      fields: [
        {
          id: "lockfile-policy",
          label: "Lockfile policy",
          type: "multi",
          options: [
            { value: "lockfile-committed", label: "Lockfile always committed" },
            { value: "ci-frozen-lockfile", label: "CI installs with a frozen/immutable lockfile flag" },
            { value: "single-lockfile-monorepo", label: "Single root lockfile for the whole monorepo" },
          ],
        },
        {
          id: "version-ranges",
          label: "Dependency version range policy",
          type: "single",
          options: [
            { value: "exact-versions", label: "Exact versions, no ^ or ~" },
            { value: "caret-ranges", label: "Caret ranges (^) for libraries, exact for apps" },
            { value: "renovate-managed", label: "Ranges managed automatically by Renovate/Dependabot" },
          ],
        },
      ],
    },
  ],
};
