import { AspectDefinition } from "./types";

export const apiDesign: AspectDefinition = {
  key: "api-design",
  title: "API Design",
  icon: "🔌",
  tagline: "API style, versioning, pagination, and payload conventions.",
  scope: ["backend"],
  cards: [
    {
      id: "style",
      title: "API style",
      fields: [
        {
          id: "style",
          label: "Primary API style",
          type: "single",
          options: [
            { value: "rest", label: "REST" },
            { value: "graphql", label: "GraphQL" },
            { value: "grpc", label: "gRPC" },
            {
              value: "trpc",
              label: "tRPC",
              description: "End-to-end type inference between client and server — its only reason to exist, so it needs TypeScript on both ends.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript"] }],
            },
            { value: "json-rpc", label: "JSON-RPC" },
            {
              value: "server-actions-only",
              label: "Server Actions / RPC-style framework functions only",
              description: "Only meaningful with a full-stack meta-framework that has this concept built in.",
              compatibleWhen: [{ aspectKey: "framework", fieldId: "framework", values: ["nextjs", "remix", "nuxt", "sveltekit", "solidstart"] }],
            },
          ],
        },
        {
          id: "versioning",
          label: "Versioning strategy",
          type: "single",
          options: [
            { value: "url-path", label: "URL path versioning (/v1/...)" },
            { value: "header", label: "Header-based versioning" },
            { value: "none-additive", label: "No versioning, additive-only changes" },
            { value: "schema-versioned", label: "Schema-versioned (GraphQL/gRPC field deprecation)" },
          ],
        },
      ],
    },
    {
      id: "contracts",
      title: "Contracts & validation",
      fields: [
        {
          id: "schema-tooling",
          label: "Schema / contract tooling",
          type: "multi",
          options: [
            { value: "openapi", label: "OpenAPI/Swagger spec" },
            { value: "graphql-sdl", label: "GraphQL SDL schema" },
            { value: "protobuf", label: "Protocol Buffers" },
            { value: "zod-shared", label: "Shared Zod/TypeBox schemas (type-safe, no separate spec)" },
          ],
        },
        {
          id: "validation-point",
          label: "Where requests are validated",
          type: "single",
          options: [
            { value: "edge-middleware", label: "Edge/middleware layer, before handler runs" },
            { value: "handler-entry", label: "First line of each handler" },
            { value: "orm-layer", label: "Left to the ORM/database constraints" },
          ],
        },
      ],
    },
    {
      id: "conventions",
      title: "Response conventions",
      fields: [
        {
          id: "pagination",
          label: "Pagination style",
          type: "single",
          options: [
            { value: "cursor", label: "Cursor-based pagination" },
            { value: "offset-limit", label: "Offset/limit pagination" },
            { value: "page-number", label: "Page-number pagination" },
            { value: "none", label: "No pagination needed" },
          ],
        },
        // Error response shape moved to Observability's "Error handling"
        // card, next to error-handling-style and error tracking/alerting.
        {
          id: "naming-case",
          label: "Payload field casing",
          type: "single",
          options: [
            { value: "camelCase", label: "camelCase" },
            { value: "snake_case", label: "snake_case" },
          ],
        },
      ],
    },
    {
      id: "patterns",
      title: "Patterns to adopt",
      fields: [
        {
          id: "patterns",
          label: "Conventions",
          type: "multi",
          options: [
            { value: "idempotency-keys", label: "Idempotency keys on unsafe write endpoints" },
            { value: "consistent-http-status", label: "Consistent, documented HTTP status code usage" },
            { value: "no-breaking-without-version", label: "No breaking field changes without a version bump" },
            { value: "backend-for-frontend", label: "Backend-for-frontend layer to shape client-specific responses" },
            { value: "rate-limit-headers", label: "Rate-limit headers on every response" },
          ],
        },
      ],
    },
  ],
};
