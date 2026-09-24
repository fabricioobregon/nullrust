import { AspectDefinition } from "./types";

export const security: AspectDefinition = {
  key: "security",
  title: "Security",
  icon: "🛡️",
  tagline: "Secrets, dependency hygiene, input handling, and hardening conventions.",
  scope: "all",
  cards: [
    {
      id: "secrets",
      title: "Secrets management",
      fields: [
        {
          id: "secrets-store",
          label: "Where secrets live",
          type: "single",
          options: [
            { value: "vault", label: "HashiCorp Vault" },
            { value: "aws-secrets-manager", label: "AWS Secrets Manager" },
            { value: "gcp-secret-manager", label: "GCP Secret Manager" },
            { value: "doppler", label: "Doppler" },
            { value: "platform-env-vars", label: "Platform-managed env vars (Vercel/Railway/etc.)" },
            { value: "dotenv-local-only", label: ".env files, local dev only, never committed" },
          ],
        },
        {
          id: "secrets-rules",
          label: "Rules to enforce",
          type: "multi",
          options: [
            { value: "no-secrets-in-git", label: "Secret-scanning on every commit/PR" },
            { value: "rotate-on-leak", label: "Rotate immediately on suspected leak" },
            { value: "no-secrets-in-logs", label: "Never log secret values, even at debug level" },
            { value: "least-privilege-keys", label: "Least-privilege scoped API keys per environment" },
          ],
        },
      ],
    },
    {
      id: "dependency-hygiene",
      title: "Dependency & supply chain",
      fields: [
        {
          id: "scanning-tool",
          label: "Dependency scanning tool",
          type: "single",
          options: [
            { value: "dependabot", label: "Dependabot" },
            { value: "snyk", label: "Snyk" },
            { value: "renovate", label: "Renovate" },
            { value: "trivy", label: "Trivy" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "supply-chain-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "lockfile-committed", label: "Lockfile always committed and enforced in CI" },
            { value: "pin-exact-versions", label: "Pin exact versions for critical dependencies" },
            { value: "sbom", label: "Generate an SBOM per release" },
            { value: "audit-in-ci", label: "Run vulnerability audit as a required CI check" },
          ],
        },
      ],
    },
    {
      id: "app-hardening",
      title: "Application hardening",
      fields: [
        {
          id: "input-handling",
          label: "Input validation & sanitization",
          type: "multi",
          options: [
            { value: "schema-validate-boundary", label: "Schema-validate every external input at the boundary" },
            { value: "parameterized-queries", label: "Parameterized queries only, never string-built SQL" },
            { value: "output-encoding", label: "Context-aware output encoding to prevent XSS" },
            { value: "file-upload-restrictions", label: "Strict file upload type/size validation" },
          ],
        },
        {
          id: "headers",
          label: "Security headers / policies",
          type: "multi",
          options: [
            { value: "csp", label: "Content-Security-Policy" },
            { value: "hsts", label: "Strict-Transport-Security" },
            { value: "csrf-protection", label: "CSRF protection on state-changing requests" },
            { value: "cors-allowlist", label: "Explicit CORS allowlist, no wildcard origins" },
          ],
        },
        {
          id: "rate-limiting",
          label: "Rate limiting / abuse prevention",
          type: "single",
          options: [
            { value: "per-ip", label: "Per-IP rate limiting" },
            { value: "per-user-token", label: "Per-user/token rate limiting" },
            { value: "waf", label: "WAF / edge-level protection" },
            { value: "none", label: "None yet" },
          ],
        },
      ],
    },
  ],
};
