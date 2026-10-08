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
          // Gated per language — this used to be four JS/TS-ecosystem
          // managers shown regardless of language, as if they were
          // universal options. c/cpp/objective-c fall through to the
          // "other" catch-all: none of the competing options (Conan,
          // vcpkg, system packages, vendoring) is dominant enough to
          // single out the way the others' tooling is.
          options: [
            { value: "npm", label: "npm", compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }] },
            {
              value: "pnpm",
              label: "pnpm",
              description: "Disk-efficient, strict by default — the modern default for new TS/JS projects.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            { value: "yarn", label: "Yarn (Berry)", compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }] },
            { value: "bun", label: "Bun", compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }] },
            { value: "pip", label: "pip", compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }] },
            {
              value: "poetry",
              label: "Poetry",
              description: "Dependency resolution + packaging + virtualenv management in one tool.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "uv",
              label: "uv",
              description: "Rust-based, dramatically faster installs — the fastest-growing modern choice.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            { value: "pipenv", label: "Pipenv", compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }] },
            {
              value: "go-mod",
              label: "go mod",
              description: "Built into the toolchain — there's no real alternative to pick.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "cargo",
              label: "Cargo",
              description: "Built into the toolchain — there's no real alternative to pick.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["rust"] }],
            },
            {
              value: "bundler",
              label: "Bundler",
              description: "The Ruby ecosystem standard — effectively the only real choice.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["ruby"] }],
            },
            { value: "maven", label: "Maven", compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "kotlin"] }] },
            {
              value: "gradle",
              label: "Gradle",
              description: "More flexible build scripting than Maven — the default for new Kotlin/Android projects.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "kotlin"] }],
            },
            {
              value: "nuget",
              label: "NuGet",
              description: "Built into the dotnet CLI — there's no real alternative to pick.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["csharp", "fsharp"] }],
            },
            {
              value: "composer",
              label: "Composer",
              description: "The PHP ecosystem standard — effectively the only real choice.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["php"] }],
            },
            {
              value: "spm",
              label: "Swift Package Manager",
              description: "Built into the toolchain — there's no real alternative to pick.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["swift"] }],
            },
            {
              value: "pub",
              label: "pub (dart/flutter pub)",
              description: "Built into the toolchain — there's no real alternative to pick.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["dart"] }],
            },
            {
              value: "mix-hex",
              label: "Mix + Hex",
              description: "Built into the toolchain — there's no real alternative to pick.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["elixir"] }],
            },
            {
              value: "sbt",
              label: "sbt",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["scala"] }],
            },
            {
              value: "cabal",
              label: "Cabal",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["haskell"] }],
            },
            {
              value: "stack",
              label: "Stack",
              description: "Wraps Cabal with reproducible, curated package snapshots.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["haskell"] }],
            },
            {
              value: "deps-edn",
              label: "tools.deps (deps.edn)",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["clojure"] }],
            },
            {
              value: "leiningen",
              label: "Leiningen",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["clojure"] }],
            },
            {
              value: "luarocks",
              label: "LuaRocks",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["lua"] }],
            },
            {
              value: "cpan",
              label: "CPAN",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["perl"] }],
            },
            {
              value: "cran",
              label: "CRAN (install.packages)",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["r"] }],
            },
            {
              value: "other-package-manager",
              label: "Other / not listed here",
              description: "For a language with no single dominant manager (C/C++/Objective-C commonly use Conan, vcpkg, system packages, or vendoring instead).",
            },
          ],
        },
        {
          id: "enforcement",
          label: "Enforcement",
          type: "multi",
          options: [
            {
              value: "engines-field",
              label: "engines field pins Node/package-manager version",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "packagemanager-field",
              label: "packageManager field in package.json (Corepack)",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
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
