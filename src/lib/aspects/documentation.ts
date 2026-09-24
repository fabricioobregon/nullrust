import { AspectDefinition } from "./types";

export const documentation: AspectDefinition = {
  key: "documentation",
  title: "Documentation",
  icon: "📚",
  tagline: "README, architecture decisions, API docs, and comment policy.",
  scope: "all",
  cards: [
    {
      id: "repo-docs",
      title: "Repository documentation",
      fields: [
        {
          id: "readme-sections",
          label: "Required README sections",
          type: "multi",
          options: [
            { value: "setup", label: "Local setup / getting started" },
            { value: "architecture-overview", label: "Architecture overview" },
            { value: "env-vars", label: "Environment variable reference" },
            { value: "deploy-instructions", label: "Deployment instructions" },
            { value: "contributing", label: "Contributing guide" },
          ],
        },
        {
          id: "adr-usage",
          label: "Architecture decision records (ADRs)",
          type: "single",
          options: [
            { value: "required-major", label: "Required for major/irreversible decisions" },
            { value: "encouraged", label: "Encouraged but not enforced" },
            { value: "none", label: "Not used" },
          ],
        },
        {
          id: "runbooks",
          label: "Operational runbooks",
          type: "single",
          options: [
            { value: "required-critical", label: "Required for every critical service" },
            { value: "as-needed", label: "Written as-needed after incidents" },
            { value: "none", label: "None" },
          ],
        },
      ],
    },
    {
      id: "api-docs",
      title: "API documentation",
      fields: [
        {
          id: "api-doc-tool",
          label: "API documentation tool",
          type: "single",
          options: [
            { value: "openapi-swagger", label: "OpenAPI/Swagger UI" },
            { value: "graphql-introspection", label: "GraphQL schema introspection (GraphiQL/Apollo Studio)" },
            { value: "postman-collection", label: "Postman collection" },
            { value: "hand-written-docs", label: "Hand-written docs site" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "doc-generation",
          label: "How docs stay in sync with code",
          type: "single",
          options: [
            { value: "generated-from-code", label: "Generated from code/types (single source of truth)" },
            { value: "manually-maintained", label: "Manually maintained, updated alongside PRs" },
            { value: "generated-in-ci", label: "Regenerated and published automatically in CI" },
          ],
        },
      ],
    },
    {
      id: "code-comments",
      title: "Inline comment policy",
      fields: [
        {
          id: "comment-policy",
          label: "Comment policy",
          type: "multi",
          options: [
            { value: "why-not-what", label: "Comments explain why, not what — code should be self-explanatory" },
            { value: "docstrings-public-api", label: "Docstrings required on all public/exported functions" },
            { value: "no-commented-out-code", label: "No commented-out code committed" },
            { value: "todo-with-ticket", label: "TODOs must reference a tracked ticket" },
          ],
        },
      ],
    },
  ],
};
