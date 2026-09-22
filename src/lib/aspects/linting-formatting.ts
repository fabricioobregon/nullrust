import { AspectDefinition } from "./types";

export const lintingFormatting: AspectDefinition = {
  key: "linting-formatting",
  title: "Linting & Formatting",
  icon: "🧹",
  tagline: "Code style enforcement, pre-commit hooks, and commit conventions.",
  cards: [
    {
      id: "tooling",
      title: "Tooling",
      fields: [
        {
          id: "linter",
          label: "Linter",
          type: "single",
          options: [
            { value: "eslint", label: "ESLint" },
            { value: "biome", label: "Biome" },
            { value: "ruff", label: "Ruff" },
            { value: "rubocop", label: "RuboCop" },
            { value: "golangci-lint", label: "golangci-lint" },
            { value: "checkstyle", label: "Checkstyle" },
          ],
        },
        {
          id: "formatter",
          label: "Formatter",
          type: "single",
          options: [
            { value: "prettier", label: "Prettier" },
            { value: "biome-format", label: "Biome (formatter)" },
            { value: "black", label: "Black" },
            { value: "gofmt", label: "gofmt" },
            { value: "rustfmt", label: "rustfmt" },
          ],
        },
      ],
    },
    {
      id: "enforcement",
      title: "Enforcement",
      fields: [
        {
          id: "pre-commit",
          label: "Pre-commit enforcement",
          type: "single",
          options: [
            { value: "husky-lint-staged", label: "Husky + lint-staged" },
            { value: "pre-commit-framework", label: "pre-commit (Python framework)" },
            { value: "ci-only", label: "No local hook — enforced only in CI" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "ci-enforcement",
          label: "CI enforcement",
          type: "multi",
          options: [
            { value: "fail-on-lint-error", label: "Fail build on lint errors" },
            { value: "fail-on-format-diff", label: "Fail build if formatter would change files" },
            { value: "fail-on-warnings", label: "Treat warnings as errors" },
          ],
        },
        {
          id: "editor-integration",
          label: "Editor integration",
          type: "multi",
          options: [
            { value: "format-on-save", label: "Format on save configured in shared editor config" },
            { value: "editorconfig", label: ".editorconfig committed" },
          ],
        },
      ],
    },
    {
      id: "commit-conventions",
      title: "Commit conventions",
      fields: [
        {
          id: "commit-format",
          label: "Commit message format",
          type: "single",
          options: [
            { value: "conventional-commits", label: "Conventional Commits (feat:, fix:, ...)" },
            { value: "free-form-imperative", label: "Free-form, imperative mood, no strict prefix" },
            { value: "jira-ticket-prefix", label: "Ticket-ID prefixed (JIRA-123: ...)" },
          ],
        },
        {
          id: "commit-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "atomic-commits", label: "Atomic commits — one logical change per commit" },
            { value: "no-wip-on-main", label: "No WIP/fixup commits on shared branches" },
            { value: "signed-commits", label: "GPG/SSH-signed commits" },
            { value: "explain-why-not-what", label: "Commit body explains why, not what" },
          ],
        },
      ],
    },
  ],
};
