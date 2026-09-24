import { AspectDefinition } from "./types";

export const dataValidationState: AspectDefinition = {
  key: "data-validation-state",
  title: "Data Validation & State",
  icon: "✅",
  tagline: "Schema validation library, frontend state management, and forms.",
  scope: ["backend", "frontend", "mobile"],
  cards: [
    {
      id: "validation",
      title: "Schema validation",
      fields: [
        {
          id: "library",
          label: "Validation library",
          type: "single",
          options: [
            { value: "zod", label: "Zod" },
            { value: "yup", label: "Yup" },
            { value: "joi", label: "Joi" },
            { value: "pydantic", label: "Pydantic" },
            { value: "class-validator", label: "class-validator" },
            { value: "json-schema", label: "Raw JSON Schema" },
          ],
        },
        {
          id: "validation-scope",
          label: "Where schemas are shared",
          type: "single",
          options: [
            { value: "shared-frontend-backend", label: "Single shared schema, used on both client and server" },
            { value: "duplicated", label: "Separate schemas per side, kept manually in sync" },
            { value: "backend-only", label: "Backend-only validation, frontend trusts UI constraints" },
          ],
        },
      ],
    },
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
            { value: "rtk-query", label: "RTK Query" },
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
            { value: "native-form-actions", label: "Native HTML forms + Server Actions" },
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
