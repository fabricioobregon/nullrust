import { AspectDefinition } from "./types";

export const programmingLanguage: AspectDefinition = {
  key: "programming-language",
  title: "Programming Language",
  icon: "💻",
  tagline: "Primary language, type safety, and style conventions.",
  scope: "all",
  cards: [
    {
      id: "language",
      title: "Primary language",
      fields: [
        {
          id: "language",
          label: "Language",
          type: "single",
          display: "cloud",
          // Ordered from lowest-level (closest to the hardware: manual
          // memory management, compiles straight to native code) to
          // highest-level (dynamic, interpreted/JIT, furthest from the
          // metal): native/systems languages, then compiled-with-managed-
          // runtime languages, then dynamic/interpreted languages.
          options: [
            { value: "c", label: "C", weight: "md" },
            { value: "cpp", label: "C++", weight: "md" },
            { value: "rust", label: "Rust", weight: "lg" },
            { value: "go", label: "Go", weight: "lg" },
            { value: "swift", label: "Swift", weight: "lg" },
            { value: "objective-c", label: "Objective-C", weight: "sm" },
            { value: "java", label: "Java", weight: "lg" },
            { value: "kotlin", label: "Kotlin", weight: "lg" },
            { value: "csharp", label: "C#", weight: "lg" },
            { value: "scala", label: "Scala", weight: "md" },
            { value: "fsharp", label: "F#", weight: "sm" },
            { value: "clojure", label: "Clojure", weight: "sm" },
            { value: "haskell", label: "Haskell", weight: "sm" },
            { value: "typescript", label: "TypeScript", weight: "xl" },
            { value: "javascript", label: "JavaScript", weight: "xl" },
            { value: "dart", label: "Dart", weight: "md" },
            { value: "python", label: "Python", weight: "xl" },
            { value: "ruby", label: "Ruby", weight: "lg" },
            { value: "php", label: "PHP", weight: "lg" },
            { value: "lua", label: "Lua", weight: "sm" },
            { value: "perl", label: "Perl", weight: "sm" },
            { value: "r", label: "R", weight: "sm" },
            { value: "elixir", label: "Elixir", weight: "sm" },
          ],
        },
        {
          id: "version-policy",
          label: "Version support policy",
          type: "single",
          options: [
            { value: "latest-lts", label: "Always track latest LTS" },
            { value: "pinned", label: "Pinned exact version, upgraded deliberately" },
            { value: "n-1", label: "Support current and previous major version" },
          ],
        },
      ],
    },
    {
      id: "typing",
      title: "Type safety",
      fields: [
        {
          id: "strictness",
          label: "Type-checking strictness",
          type: "single",
          options: [
            { value: "strict", label: "Strict mode, no implicit any / no untyped code" },
            { value: "moderate", label: "Moderate — strict on new code, loose on legacy" },
            { value: "none", label: "No static typing enforced" },
          ],
        },
        {
          id: "typing-tools",
          label: "Type-checking tooling",
          type: "multi",
          options: [
            { value: "tsc", label: "tsc (TypeScript compiler)" },
            { value: "mypy", label: "mypy" },
            { value: "pyright", label: "pyright" },
            { value: "sorbet", label: "Sorbet" },
          ],
        },
      ],
    },
    {
      id: "style",
      title: "Style & idioms",
      fields: [
        {
          id: "naming-case",
          label: "Variable / function naming",
          type: "single",
          options: [
            { value: "camelCase", label: "camelCase" },
            { value: "snake_case", label: "snake_case" },
          ],
        },
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "functional-first", label: "Prefer functional/immutable style over classes" },
            { value: "no-any", label: "Disallow escape hatches (any, ts-ignore) without justification" },
            { value: "explicit-return-types", label: "Explicit return types on exported functions" },
            { value: "no-default-exports", label: "Named exports only, no default exports" },
            { value: "early-returns", label: "Early returns over nested conditionals" },
          ],
        },
      ],
    },
  ],
};
