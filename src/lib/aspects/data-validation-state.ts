import { AspectDefinition } from "./types";

export const dataValidationState: AspectDefinition = {
  key: "data-validation-state",
  title: "Frontend State & Forms",
  icon: "✅",
  tagline: "Frontend state management and forms.",
  // Schema validation moved to Programming Language's "Type safety &
  // validation" card — Pydantic *is* both a type system and a validator in
  // Python, and Zod/TS pairings are decided together in practice, so the
  // two questions belong next to each other rather than in separate aspects.
  scope: ["frontend", "mobile"],
  cards: [
    {
      id: "state-management",
      title: "Frontend state management",
      fields: [
        {
          id: "client-state",
          label: "Client/UI state",
          type: "single",
          // Originally unconditional, which meant a Vue/Angular/Svelte/
          // Flutter/SwiftUI/Compose/MAUI project was offered five
          // React-only options and nothing that actually applied to it —
          // same "zero real options for a whole swath of frameworks" bug
          // as framework.framework's long-tail-language gap. Every option
          // below is now gated to the frameworks it's actually idiomatic
          // for; with no framework answered yet, the usual "nothing to
          // narrow by" fallback shows all of them, same as elsewhere.
          options: [
            {
              value: "react-state-context",
              label: "React useState/useReducer + Context",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nextjs", "remix", "react-native"] }],
            },
            {
              value: "zustand",
              label: "Zustand",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nextjs", "remix", "react-native"] }],
            },
            {
              value: "redux-toolkit",
              label: "Redux Toolkit",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nextjs", "remix", "react-native"] }],
            },
            {
              value: "jotai-recoil",
              label: "Jotai / Recoil (atoms)",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nextjs", "remix", "react-native"] }],
            },
            {
              value: "signals",
              label: "Signals",
              description: "Solid's core reactivity primitive.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["solidstart", "solid-vite"] }],
            },
            {
              value: "pinia",
              label: "Pinia",
              description: "Vue's official state management library.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nuxt", "vue-vite"] }],
            },
            {
              value: "angular-services-signals",
              label: "Services + Signals/RxJS",
              description: "Angular's own DI-based services, with Signals (newer) or RxJS observables for reactive state.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["angular"] }],
            },
            {
              value: "svelte-stores",
              label: "Svelte stores / runes",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["sveltekit", "svelte-vite"] }],
            },
            {
              value: "flutter-riverpod",
              label: "Riverpod / Provider / Bloc",
              description: "The three mainstream Flutter state-management approaches, in roughly most-to-least-recommended order.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["flutter"] }],
            },
            {
              value: "swiftui-observable",
              label: "@State / @Observable",
              description: "SwiftUI's own property-wrapper-based state, no external library needed.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["swiftui"] }],
            },
            {
              value: "compose-viewmodel",
              label: "ViewModel + StateFlow",
              description: "Jetpack Compose's recommended pattern — remember/mutableStateOf for local UI state, ViewModel+StateFlow for anything that survives recomposition.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["jetpack-compose"] }],
            },
            {
              value: "maui-mvvm",
              label: "MVVM (ObservableObject/INotifyPropertyChanged)",
              description: ".NET MAUI's idiomatic data-binding pattern.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["maui"] }],
            },
            // Ungated universal fallback — every other narrowed field in
            // this registry keeps one of these so compatibleOptions()'s
            // "never show zero" safety net never has to engage. Covers an
            // unanswered/no-framework repo and anything genuinely not
            // listed above.
            { value: "other", label: "Other / not listed above" },
          ],
        },
        {
          id: "server-state",
          label: "Server/remote state caching",
          type: "single",
          options: [
            { value: "react-query", label: "TanStack Query" },
            { value: "swr", label: "SWR" },
            {
              value: "rtk-query",
              label: "RTK Query",
              // RTK Query ships as part of the Redux Toolkit package —
              // not a general option once client state isn't Redux.
              compatibleWhen: [{ aspectKey: "data-validation-state", fieldId: "client-state", values: ["redux-toolkit"] }],
            },
            { value: "framework-native", label: "Framework-native data fetching (e.g. RSC + fetch cache)" },
            { value: "none", label: "None — manual fetch + local state" },
          ],
        },
      ],
    },
    {
      id: "forms",
      title: "Forms",
      fields: [
        {
          id: "form-library",
          label: "Form handling",
          type: "single",
          options: [
            { value: "react-hook-form", label: "React Hook Form" },
            { value: "formik", label: "Formik" },
            {
              value: "native-form-actions",
              label: "Native HTML forms + Server Actions",
              // "Server Actions" specifically names the Next.js/React
              // App Router feature, not a generic pattern.
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nextjs"] }],
            },
            { value: "tanstack-form", label: "TanStack Form" },
          ],
        },
        {
          id: "form-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "validate-on-blur", label: "Validate on blur, not on every keystroke" },
            { value: "server-revalidate", label: "Always re-validate on the server, never trust client validation alone" },
            { value: "optimistic-updates", label: "Optimistic UI updates with rollback on error" },
            { value: "progressive-enhancement", label: "Forms work without JavaScript (progressive enhancement)" },
          ],
        },
      ],
    },
  ],
};
