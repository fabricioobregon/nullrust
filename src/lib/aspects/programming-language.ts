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
          options: [
            { value: "typescript", label: "TypeScript" },
            { value: "javascript", label: "JavaScript" },
            { value: "python", label: "Python" },
            { value: "go", label: "Go" },
            { value: "java", label: "Java" },
            { value: "kotlin", label: "Kotlin" },
            { value: "csharp", label: "C#" },
            { value: "ruby", label: "Ruby" },
            { value: "rust", label: "Rust" },
            { value: "php", label: "PHP" },
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
