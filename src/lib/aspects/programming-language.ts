import { AspectDefinition } from "./types";
import { LANGUAGE_ICONS } from "@/lib/language-icons";

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
            { value: "c", label: "C", weight: "md", group: "systems", icon: LANGUAGE_ICONS.c },
            { value: "cpp", label: "C++", weight: "md", group: "systems", icon: LANGUAGE_ICONS.cpp },
            { value: "rust", label: "Rust", weight: "lg", group: "systems", icon: LANGUAGE_ICONS.rust },
            { value: "go", label: "Go", weight: "lg", group: "systems", icon: LANGUAGE_ICONS.go },
            { value: "swift", label: "Swift", weight: "lg", group: "systems", icon: LANGUAGE_ICONS.swift },
            {
              value: "objective-c",
              label: "Objective-C",
              weight: "sm",
              group: "systems",
              icon: LANGUAGE_ICONS["objective-c"],
            },
            { value: "java", label: "Java", weight: "lg", group: "managed", icon: LANGUAGE_ICONS.java },
            { value: "kotlin", label: "Kotlin", weight: "lg", group: "managed", icon: LANGUAGE_ICONS.kotlin },
            { value: "csharp", label: "C#", weight: "lg", group: "managed", icon: LANGUAGE_ICONS.csharp },
            { value: "scala", label: "Scala", weight: "md", group: "managed", icon: LANGUAGE_ICONS.scala },
            { value: "fsharp", label: "F#", weight: "sm", group: "managed", icon: LANGUAGE_ICONS.fsharp },
            { value: "clojure", label: "Clojure", weight: "sm", group: "managed", icon: LANGUAGE_ICONS.clojure },
            { value: "haskell", label: "Haskell", weight: "sm", group: "managed", icon: LANGUAGE_ICONS.haskell },
            {
              value: "typescript",
              label: "TypeScript",
              weight: "xl",
              group: "dynamic",
              icon: LANGUAGE_ICONS.typescript,
            },
            {
              value: "javascript",
              label: "JavaScript",
              weight: "xl",
              group: "dynamic",
              icon: LANGUAGE_ICONS.javascript,
            },
            { value: "dart", label: "Dart", weight: "md", group: "dynamic", icon: LANGUAGE_ICONS.dart },
            { value: "python", label: "Python", weight: "xl", group: "dynamic", icon: LANGUAGE_ICONS.python },
            { value: "ruby", label: "Ruby", weight: "lg", group: "dynamic", icon: LANGUAGE_ICONS.ruby },
            { value: "php", label: "PHP", weight: "lg", group: "dynamic", icon: LANGUAGE_ICONS.php },
            { value: "lua", label: "Lua", weight: "sm", group: "dynamic", icon: LANGUAGE_ICONS.lua },
            { value: "perl", label: "Perl", weight: "sm", group: "dynamic", icon: LANGUAGE_ICONS.perl },
            { value: "r", label: "R", weight: "sm", group: "dynamic", icon: LANGUAGE_ICONS.r },
            { value: "elixir", label: "Elixir", weight: "sm", group: "dynamic", icon: LANGUAGE_ICONS.elixir },
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
