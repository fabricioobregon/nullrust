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
          options: [
            { value: "react-state-context", label: "React useState/useReducer + Context" },
            { value: "zustand", label: "Zustand" },
            { value: "redux-toolkit", label: "Redux Toolkit" },
            { value: "jotai-recoil", label: "Jotai / Recoil (atoms)" },
            { value: "signals", label: "Signals (Preact Signals/Solid)" },
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
