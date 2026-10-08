import { AspectDefinition } from "./types";
import { LANGUAGE_ICONS } from "@/lib/language-icons";

// Language clusters reused across this file's compatibleWhen rules.
const STATIC_COMPILER_TYPED = [
  "c", "cpp", "rust", "go", "swift", "objective-c", "java", "kotlin",
  "csharp", "scala", "fsharp", "haskell", "dart",
];
const UNTYPED_DYNAMIC = ["javascript", "clojure", "lua", "perl", "r", "php", "elixir"];

export const programmingLanguage: AspectDefinition = {
  key: "programming-language",
  title: "Programming Language",
  icon: "💻",
  tagline: "Primary language, version target, type safety & validation, and concurrency.",
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
          id: "target-version",
          label: "Target version",
          type: "text",
          placeholder: "e.g. Python 3.12, Node 20 LTS / TypeScript 5.5, Go 1.23",
          description:
            "The concrete version an AI agent can rely on — bounds which syntax, stdlib APIs, and language features are actually safe to generate.",
        },
      ],
    },
    // Error handling moved to Observability's "Error handling" card —
    // see that aspect for the full story (style, API error shape, and how
    // it's tracked/alerted on) kept together in one place.
    {
      id: "typing",
      title: "Type safety & validation",
      description:
        "Static type checking and runtime schema validation, side by side — Pydantic is both at once in Python, and a Zod schema's inferred type is what tsc then checks in TypeScript.",
      fields: [
        {
          id: "strictness",
          label: "Type-checking strictness",
          type: "single",
          options: [
            {
              value: "strict",
              label: "Strict mode, no implicit any / no untyped code",
              description: "Fewest type-related mistakes an AI agent can introduce silently — the safer default for a codebase agents actively write in.",
              recommended: true,
            },
            { value: "moderate", label: "Moderate — strict on new code, loose on legacy", description: "Common migration posture for an existing codebase adopting stricter typing gradually." },
            { value: "none", label: "No static typing enforced", description: "Relies entirely on tests and review to catch type errors." },
          ],
        },
        {
          id: "typing-tools",
          label: "Type-checking tooling",
          type: "multi",
          options: [
            {
              value: "tsc",
              label: "tsc (TypeScript compiler)",
              description: "TypeScript's own compiler in --noEmit mode is the type checker; no separate tool needed.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript"] }],
            },
            {
              value: "mypy",
              label: "mypy",
              description: "The long-standing standard — broadest ecosystem support for stubs and framework plugins (Django, etc.).",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "pyright",
              label: "pyright",
              description: "Faster, Microsoft-maintained — what VS Code's Pylance runs under the hood.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "sorbet",
              label: "Sorbet",
              description: "Gradual typing for Ruby with the most mature tooling and editor support.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["ruby"] }],
            },
            {
              value: "rbs-steep",
              label: "RBS + Steep",
              description: "Ruby's own type-signature format plus a checker — less tooling maturity than Sorbet, no runtime dependency.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["ruby"] }],
            },
            {
              value: "compiler-builtin",
              label: "Compiler enforces types (no separate tool needed)",
              description: "This language's own compiler is the type checker — there's no separate tool to pick.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: STATIC_COMPILER_TYPED }],
            },
            {
              value: "untyped-dynamic",
              label: "No static type checker in use",
              description: "No mainstream static type checker for this language/ecosystem is in use on this project.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: UNTYPED_DYNAMIC }],
            },
          ],
        },
        {
          id: "library",
          label: "Runtime schema validation library",
          type: "single",
          // Field-level exclusion, not per-option: every option here used to
          // be tagged repos:["backend","frontend","mobile"] individually —
          // for an infra/"other" repo that excludes all of them at once and
          // triggers compatibleOptions()'s fallback, silently showing every
          // option anyway. Found by scripts/verify-registry.ts, the exact
          // bug class error-shape and the ORM fields already had.
          repos: ["backend", "frontend", "mobile"],
          options: [
            {
              value: "zod",
              label: "Zod",
              description: "The default for new TS projects — its inferred types are what tsc then checks.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "yup",
              label: "Yup",
              description: "Older, still common in pre-existing React Hook Form / Formik setups.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "joi",
              label: "Joi",
              description: "Node-ecosystem veteran, common on Express/Hapi backends predating Zod.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "pydantic",
              label: "Pydantic",
              description: "The Python default — the same model doubles as the type annotation and the runtime validator.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "class-validator",
              label: "class-validator",
              description: "Decorator-based validation, the NestJS-ecosystem default.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript"] }],
            },
            {
              value: "json-schema",
              label: "Raw JSON Schema",
              description: "Language-agnostic — usable from any language via an ajv/jsonschema-style library.",
            },
          ],
        },
        {
          id: "validation-scope",
          label: "Where schemas are shared",
          type: "single",
          repos: ["backend", "frontend", "mobile"],
          options: [
            {
              value: "shared-frontend-backend",
              label: "Single shared schema, used on both client and server",
              description: "One schema, imported on both sides — the two can't silently drift apart.",
            },
            {
              value: "duplicated",
              label: "Separate schemas per side, kept manually in sync",
              description: "Common when client and server are different languages — needs discipline to keep aligned.",
            },
            {
              value: "backend-only",
              label: "Backend-only validation, frontend trusts UI constraints",
              description: "Fewer moving parts, but a non-browser client (another service, a script) gets no validation at all client-side.",
            },
          ],
        },
      ],
    },
    {
      id: "concurrency",
      title: "Concurrency & async",
      description:
        "How concurrent/async work is actually written — comparable in weight to error handling for how an AI agent structures generated code, and just as easy to get wrong by defaulting to training-data habits from a different language.",
      fields: [
        {
          id: "concurrency-model",
          label: "Concurrency model",
          type: "single",
          options: [
            {
              value: "async-await",
              label: "async/await",
              description: "Cooperative concurrency on a single-threaded event loop (or similar) — the mainstream default for TS/JS/Python/C#/Rust/Swift.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript", "python", "csharp", "rust", "swift"] }],
            },
            {
              value: "goroutines-channels",
              label: "Goroutines + channels",
              description: "Lightweight language-managed threads communicating over channels — Go's idiomatic, effectively mandatory model.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "actor-model-beam",
              label: "Actor model (BEAM processes)",
              description: "Isolated, message-passing processes supervised for failure — Elixir's idiomatic concurrency, not a library choice.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["elixir"] }],
            },
            {
              value: "coroutines-structured",
              label: "Structured coroutines",
              description: "Kotlin's coroutines + structured concurrency (scopes, cancellation propagation) rather than raw threads.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["kotlin"] }],
            },
            {
              value: "threads-locks",
              label: "Threads + locks",
              description: "OS-level threads with explicit synchronization — the traditional model for Java and C/C++.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "c", "cpp"] }],
            },
            {
              value: "primarily-synchronous",
              label: "Primarily synchronous, no real concurrency model",
              description: "No concurrency to speak of in this codebase — fine for a script, CLI tool, or simple sequential service.",
            },
          ],
        },
        {
          id: "concurrency-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            {
              value: "no-shared-mutable-state",
              label: "No shared mutable state across concurrent units without explicit synchronization",
              description: "The single most common source of concurrency bugs, regardless of language.",
              recommended: true,
            },
            {
              value: "structured-concurrency",
              label: "Structured concurrency — a child task's lifetime never outlives its parent scope",
              description: "No detached/fire-and-forget tasks that can leak or outlive what spawned them.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["kotlin", "swift", "python"] }],
            },
            {
              value: "cpu-bound-off-event-loop",
              label: "CPU-bound work moved off the event loop (worker threads/processes)",
              description: "A tight synchronous loop on the event-loop thread blocks every other concurrent task.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript", "python"] }],
            },
            {
              value: "gil-aware-multiprocessing",
              label: "GIL-aware: multiprocessing (not threading) for CPU-bound Python work",
              description: "CPython's GIL means threads don't parallelize CPU-bound work — only I/O-bound work benefits.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "no-blocking-calls-in-async",
              label: "No blocking/synchronous calls inside async functions",
              description: "A single blocking call stalls every other task sharing that event loop/thread.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript", "python", "rust", "csharp"] }],
            },
          ],
        },
      ],
    },
    {
      id: "style",
      title: "Style & idioms",
      fields: [
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "functional-first", label: "Prefer functional/immutable style over classes", description: "Favor pure functions and immutable data over mutable object state where the language allows it." },
            { value: "early-returns", label: "Early returns over nested conditionals", description: "Flattens control flow — generally easier for both humans and agents to follow.", recommended: true },
            {
              value: "no-any",
              label: "Disallow escape hatches (any, ts-ignore) without justification",
              description: "Require a comment explaining why whenever a type-safety escape hatch is used.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript"] }],
            },
            {
              value: "explicit-return-types",
              label: "Explicit return type annotations on exported/public functions",
              description: "Don't rely on inference at a module's public boundary, even where the language allows it.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "python", "kotlin"] }],
            },
            {
              value: "no-default-exports",
              label: "Named exports only, no default exports",
              description: "Keeps imports consistent and renames traceable across the codebase.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "type-hints-everywhere",
              label: "Type hints on all public functions/methods",
              description: "PEP 484 annotations at every public boundary, even with strictness set to moderate.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "dataclasses-over-dicts",
              label: "Dataclasses/Pydantic models over raw dicts",
              description: "Structured data gets a real type instead of being passed around as an untyped dict.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "context-managers",
              label: "Context managers for resource cleanup",
              description: "`with` blocks instead of manual try/finally for anything that needs closing or releasing.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "accept-interfaces-return-structs",
              label: "Accept interfaces, return concrete structs",
              description: "Keeps function signatures flexible for callers and concrete for implementers — idiomatic Go.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "wrap-errors",
              label: "Wrap errors with context (fmt.Errorf(\"...: %w\", err))",
              description: "Preserve the original error while adding what the caller needs to debug it.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "no-naked-returns",
              label: "No naked returns in functions longer than a few lines",
              description: "Named return values should still be returned explicitly once a function has any real length.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "prefer-iterators",
              label: "Prefer iterator chains over manual index loops",
              description: "map/filter/fold-style chains over hand-rolled `for` loops with manual indices.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["rust"] }],
            },
            {
              value: "no-unwrap-in-prod",
              label: "No .unwrap()/.expect() on paths reachable in production",
              description: "Propagate or handle the error instead — reserve unwrap/expect for tests and truly-impossible states.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["rust"] }],
            },
            {
              value: "newtype-pattern",
              label: "Newtypes over primitive obsession",
              description: "Wrap bare String/u64/etc. in a distinct type when it represents a specific concept (UserId, not u64).",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["rust"] }],
            },
            {
              value: "immutable-data-classes",
              label: "Immutable data classes/records over mutable POJOs",
              description: "Prefer Java records / Kotlin data classes with val properties over classic mutable beans.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "kotlin"] }],
            },
            {
              value: "avoid-null-use-optional",
              label: "Avoid returning null; use Optional<T> / nullable types explicitly",
              description: "Makes absence part of the type signature instead of an undocumented possibility.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "kotlin"] }],
            },
            {
              value: "nullable-reference-types",
              label: "Nullable reference types enabled project-wide",
              description: "`<Nullable>enable</Nullable>` so the compiler tracks nullability instead of leaving it undocumented.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["csharp"] }],
            },
            {
              value: "guard-over-nested-if",
              label: "Guard statements for early exits over nested if-let",
              description: "`guard let ... else { return }` instead of pyramids of nested optional-unwrapping.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["swift"] }],
            },
          ],
        },
      ],
    },
  ],
};
