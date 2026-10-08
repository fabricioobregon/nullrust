import { AspectDefinition } from "./types";

export const auth: AspectDefinition = {
  key: "auth",
  title: "Authentication & Authorization",
  icon: "🔐",
  tagline: "Identity provider, session strategy, and access-control model.",
  scope: "all",
  cards: [
    {
      id: "authentication",
      title: "Authentication",
      fields: [
        {
          id: "provider",
          label: "Auth provider / library",
          type: "single",
          options: [
            { value: "nextauth", label: "NextAuth.js / Auth.js" },
            { value: "auth0", label: "Auth0" },
            { value: "clerk", label: "Clerk" },
            { value: "cognito", label: "AWS Cognito" },
            { value: "firebase-auth", label: "Firebase Auth" },
            { value: "keycloak", label: "Keycloak" },
            { value: "custom", label: "Custom-built" },
            { value: "supabase-auth", label: "Supabase Auth" },
          ],
        },
        {
          id: "session-strategy",
          label: "Session strategy",
          type: "single",
          // Covers both the strategy and where it's physically stored in one
          // field — these used to be two separate, inconsistently-worded
          // questions split across this aspect and Caching's "Session &
          // state storage" card (merged here; see caching.ts's history).
          options: [
            {
              value: "jwt-stateless",
              label: "Stateless JWT, no server-side session",
              description: "Nothing to store or revoke server-side — scales trivially, but a token can't be invalidated before it expires.",
            },
            {
              value: "jwt-refresh",
              label: "JWT access token + refresh token rotation",
              description: "Short-lived access token plus a longer-lived refresh token — bounds how long a stolen access token stays valid.",
            },
            {
              value: "server-session-redis",
              label: "Server-side session, Redis-backed",
              description: "Sessions can be revoked instantly and inspected server-side; Redis keeps lookups fast under load.",
            },
            {
              value: "server-session-db",
              label: "Server-side session, database-backed",
              description: "Same revocability as Redis-backed sessions, no extra infra dependency, at the cost of a DB round-trip per request.",
            },
            {
              value: "signed-cookie",
              label: "Signed/encrypted cookie, no server-side store",
              description: "Session data lives in the cookie itself, tamper-proofed by a signature — no server-side store, but size-limited and not instantly revocable.",
            },
          ],
        },
        {
          id: "auth-methods",
          label: "Supported sign-in methods",
          type: "multi",
          options: [
            { value: "password", label: "Email + password" },
            { value: "oauth-social", label: "OAuth social login (Google/GitHub/etc.)" },
            { value: "magic-link", label: "Magic link / passwordless email" },
            { value: "sso-saml", label: "Enterprise SSO (SAML/OIDC)" },
            { value: "mfa", label: "Multi-factor authentication" },
            { value: "passkeys", label: "Passkeys / WebAuthn" },
          ],
        },
      ],
    },
    {
      id: "authorization",
      title: "Authorization model",
      fields: [
        {
          id: "model",
          label: "Access control model",
          type: "single",
          options: [
            { value: "rbac", label: "Role-based access control (RBAC)" },
            { value: "abac", label: "Attribute-based access control (ABAC)" },
            { value: "acl", label: "Per-resource access control lists" },
            { value: "ownership-only", label: "Simple ownership checks only" },
          ],
        },
        {
          id: "enforcement-point",
          label: "Where authorization is enforced",
          type: "multi",
          options: [
            { value: "middleware", label: "Route middleware / gateway" },
            { value: "service-layer", label: "Service/business-logic layer" },
            {
              value: "db-row-level-security",
              label: "Database row-level security",
              // RLS is a real, native Postgres feature — not a general SQL
              // one (MySQL has no equivalent, Mongo/Dynamo have no "rows").
              compatibleWhen: [{ aspectKey: "database", fieldId: "engine", values: ["postgresql"] }],
            },
            { value: "ui-only", label: "UI-level only (not a real boundary)" },
          ],
        },
        {
          id: "multi-tenancy",
          label: "Multi-tenancy model",
          type: "single",
          options: [
            { value: "single-tenant", label: "Single-tenant, no tenant concept" },
            { value: "shared-db-tenant-column", label: "Shared database, tenant_id column on every table" },
            { value: "schema-per-tenant", label: "Schema-per-tenant" },
            { value: "db-per-tenant", label: "Database-per-tenant" },
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
            { value: "never-trust-client-id", label: "Never trust a client-supplied user/tenant id — derive from session" },
            { value: "deny-by-default", label: "Deny by default; explicitly grant access" },
            { value: "auth-checks-in-actions", label: "Every Server Action/mutation re-checks auth, not just the page render" },
            { value: "short-lived-tokens", label: "Short-lived access tokens with rotation" },
            { value: "audit-log-sensitive", label: "Audit log for sensitive/privileged actions" },
          ],
        },
      ],
    },
  ],
};
