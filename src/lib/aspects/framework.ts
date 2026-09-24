import { AspectDefinition } from "./types";

export const framework: AspectDefinition = {
  key: "framework",
  title: "Framework",
  icon: "🧩",
  tagline: "Application framework and structural conventions.",
  scope: ["backend", "frontend", "mobile"],
  cards: [
    {
      id: "framework",
      title: "Application framework",
      fields: [
        {
          id: "framework",
          label: "Framework",
          type: "single",
          options: [
            { value: "nextjs", label: "Next.js" },
            { value: "remix", label: "Remix / React Router" },
            { value: "express", label: "Express" },
            { value: "nestjs", label: "NestJS" },
            { value: "fastify", label: "Fastify" },
            { value: "django", label: "Django" },
            { value: "fastapi", label: "FastAPI" },
            { value: "rails", label: "Ruby on Rails" },
            { value: "spring-boot", label: "Spring Boot" },
            { value: "aspnet-core", label: "ASP.NET Core" },
            { value: "laravel", label: "Laravel" },
          ],
        },
        {
          id: "rendering",
          label: "Rendering / architecture style",
          type: "single",
          options: [
            { value: "ssr", label: "Server-rendered (SSR)" },
            { value: "spa", label: "Client-rendered SPA" },
            { value: "static", label: "Static-generated" },
            { value: "hybrid", label: "Hybrid (SSR + client islands)" },
            { value: "api-only", label: "API-only backend, no rendering" },
          ],
        },
      ],
    },
    {
      id: "structure",
      title: "Project structure",
      fields: [
        {
          id: "organization",
          label: "Code organization",
          type: "single",
          options: [
            { value: "feature-based", label: "Feature/domain-based folders" },
            { value: "layer-based", label: "Layer-based folders (controllers/services/models)" },
            { value: "monorepo", label: "Monorepo with multiple packages/apps" },
          ],
        },
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "dependency-injection", label: "Dependency injection" },
            { value: "service-layer", label: "Thin controllers, logic in a service layer" },
            { value: "dto-validation", label: "DTOs / schema validation at every boundary" },
            { value: "colocate-tests", label: "Colocate tests next to source files" },
            { value: "no-business-logic-in-routes", label: "No business logic directly in route handlers" },
          ],
        },
      ],
    },
  ],
};
