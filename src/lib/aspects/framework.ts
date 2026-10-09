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
      description: "This narrows the Database, Testing, and Linting aspects to only what's compatible with it.",
      fields: [
        {
          id: "framework",
          label: "Framework",
          type: "single",
          options: [
            {
              value: "nextjs",
              label: "Next.js",
              description: "Full-stack React — SSR, routing, and API routes built in.",
              recommended: true,
              repos: ["frontend", "backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "remix",
              label: "Remix / React Router",
              description: "Full-stack React, focused on web standards and nested routing.",
              repos: ["frontend", "backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "nuxt",
              label: "Nuxt",
              description: "Full-stack Vue — SSR, routing, and API routes built in, the Vue equivalent of Next.js.",
              repos: ["frontend", "backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "vue-vite",
              label: "Vue (Vite, no meta-framework)",
              description: "Client-rendered Vue without SSR/routing/API conventions built in.",
              repos: ["frontend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "angular",
              label: "Angular",
              description: "Full-featured, opinionated framework with routing, forms, and DI built in — TypeScript-only by convention.",
              repos: ["frontend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript"] }],
            },
            {
              value: "sveltekit",
              label: "SvelteKit",
              description: "Full-stack Svelte — SSR, routing, and API routes built in, the Svelte equivalent of Next.js.",
              repos: ["frontend", "backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "svelte-vite",
              label: "Svelte (Vite, no meta-framework)",
              description: "Client-rendered Svelte without SSR/routing/API conventions built in.",
              repos: ["frontend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "solidstart",
              label: "SolidStart",
              description: "Full-stack SolidJS — SSR, routing, and API routes built in, the Solid equivalent of Next.js.",
              repos: ["frontend", "backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "solid-vite",
              label: "SolidJS (Vite, no meta-framework)",
              description: "Client-rendered Solid without SSR/routing/API conventions built in.",
              repos: ["frontend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "express",
              label: "Express",
              description: "Minimal and unopinionated — you assemble the pieces yourself.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "nestjs",
              label: "NestJS",
              description: "Opinionated, Angular-inspired structure — scales well with larger teams.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "fastify",
              label: "Fastify",
              description: "Lightweight and fast, with less built-in structure than NestJS.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "django",
              label: "Django",
              description: "Batteries-included — admin panel, ORM, and auth built in.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "fastapi",
              label: "FastAPI",
              description: "Async-first, type-hint-driven — the common default for new APIs.",
              recommended: true,
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "rails",
              label: "Ruby on Rails",
              description: "Convention over configuration — fast to build, opinionated structure.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["ruby"] }],
            },
            {
              value: "spring-boot",
              label: "Spring Boot",
              description: "Mature, enterprise-standard choice for JVM backends.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "kotlin"] }],
            },
            {
              value: "ktor",
              label: "Ktor",
              description: "JetBrains' own Kotlin-native framework — coroutine-based, lighter-weight than Spring Boot.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["kotlin"] }],
            },
            {
              value: "aspnet-core",
              label: "ASP.NET Core",
              description: "Microsoft's standard framework for .NET backends.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["csharp"] }],
            },
            {
              value: "laravel",
              label: "Laravel",
              description: "Batteries-included PHP framework — admin tooling, ORM, and auth built in.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["php"] }],
            },
            {
              value: "gin",
              label: "Gin",
              description: "Minimal HTTP router — fast and low-level.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "echo",
              label: "Echo",
              description: "Minimal HTTP framework, similar footprint to Gin.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "fiber",
              label: "Fiber",
              description: "Express-inspired API, built on fasthttp for performance.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "actix-web",
              label: "Actix Web",
              description: "High-performance, actor-based — steeper learning curve.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["rust"] }],
            },
            {
              value: "axum",
              label: "Axum",
              description: "Modern, tower-based — a simpler mental model than Actix.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["rust"] }],
            },
            {
              value: "vapor",
              label: "Vapor",
              description: "Server-side Swift — the closest thing to a standard for Swift backends.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["swift"] }],
            },
            {
              value: "play-framework",
              label: "Play Framework",
              description: "Reactive, async-first web framework for Scala/Java.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["scala"] }],
            },
            {
              value: "phoenix",
              label: "Phoenix",
              description: "Elixir's standard — built on the BEAM's concurrency model.",
              repos: ["backend"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["elixir"] }],
            },
            {
              value: "react-native",
              label: "React Native",
              description: "Cross-platform — one codebase for iOS and Android.",
              repos: ["mobile"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "flutter",
              label: "Flutter",
              description: "Cross-platform via Dart, with its own rendering engine.",
              repos: ["mobile"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["dart"] }],
            },
            {
              value: "swiftui",
              label: "SwiftUI",
              description: "Native iOS only — best integration with Apple platforms.",
              repos: ["mobile"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["swift"] }],
            },
            {
              value: "jetpack-compose",
              label: "Jetpack Compose",
              description: "Native Android only — Google's modern UI toolkit.",
              repos: ["mobile"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["kotlin", "java"] }],
            },
            {
              value: "maui",
              label: ".NET MAUI",
              description: "Cross-platform UI framework for .NET — iOS, Android, and desktop.",
              repos: ["mobile"],
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["csharp"] }],
            },
            {
              value: "none",
              label: "None — no application framework",
              description: "No framework in use (common for C, C++, Haskell, Lua, and similar) — or a deliberate choice to build on bare language primitives.",
              // Deliberately ungated — every language/repo kind can
              // legitimately have no framework. Also what keeps this field
              // from ever hitting compatibleOptions()'s empty-field
              // fallback: languages like C/C++/Haskell/Lua/Perl/R have no
              // other option at all, which previously meant every other
              // language's framework (Django, Rails, Next.js, ...) showed
              // up as "compatible" with them. Found by verify-registry.ts.
            },
          ],
        },
        {
          id: "rendering",
          label: "Rendering / architecture style",
          type: "single",
          // A mobile app has no "rendering model" in this sense at all
          // (no SSR/SPA/static/hybrid/api-only) — hard-excluded rather than
          // narrowed, so it doesn't fall back to showing all 5 anyway.
          repos: ["backend", "frontend"],
          options: [
            { value: "ssr", label: "Server-rendered (SSR)", description: "Each request renders fresh on the server — best for SEO and freshness." },
            { value: "spa", label: "Client-rendered SPA", description: "Renders in the browser after an initial load — feels like an app, worse for SEO." },
            { value: "static", label: "Static-generated", description: "Pre-built at deploy time — fastest and cheapest, not for per-request data." },
            { value: "hybrid", label: "Hybrid (SSR + client islands)", description: "Server-renders by default, hydrates specific interactive pieces." },
            { value: "api-only", label: "API-only backend, no rendering", description: "No HTML rendering — pure JSON API for a separate frontend." },
          ],
        },
      ],
    },
    {
      id: "structure",
      title: "Project structure",
      description: "How contributors (and coding agents) should organize new code in this repo.",
      fields: [
        {
          id: "organization",
          label: "Code organization",
          type: "single",
          options: [
            {
              value: "feature-based",
              label: "Feature/domain-based folders",
              description: "Group by domain (e.g. /users, /billing) rather than by technical layer.",
              recommended: true,
            },
            {
              value: "layer-based",
              label: "Layer-based folders (controllers/services/models)",
              description: "Group by technical role across every feature.",
            },
            {
              value: "monorepo",
              label: "Monorepo with multiple packages/apps",
              description: "Several apps/packages managed together in one repository.",
            },
          ],
        },
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            {
              value: "dependency-injection",
              label: "Dependency injection",
              description: "Pass dependencies in rather than importing them directly — easier to test and swap.",
            },
            {
              value: "service-layer",
              label: "Thin controllers, logic in a service layer",
              description: "Route handlers only orchestrate; business rules live in a dedicated layer.",
              recommended: true,
            },
            {
              value: "dto-validation",
              label: "DTOs / schema validation at every boundary",
              description: "Validate and shape data wherever it crosses a boundary — request in, response out.",
            },
            {
              value: "colocate-tests",
              label: "Colocate tests next to source files",
              description: "Keep test files beside the code they test, not in a separate mirrored tree.",
            },
            {
              value: "no-business-logic-in-routes",
              label: "No business logic directly in route handlers",
              description: "Handlers call into services; they don't contain the rules themselves.",
            },
          ],
        },
      ],
    },
  ],
};
