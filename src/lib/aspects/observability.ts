import { AspectDefinition } from "./types";

export const observability: AspectDefinition = {
  key: "observability",
  title: "Observability",
  icon: "📡",
  tagline: "Logging, metrics, tracing, error handling, tracking, and alerting.",
  scope: "all",
  cards: [
    {
      id: "logging",
      title: "Logging",
      fields: [
        {
          id: "log-format",
          label: "Log format",
          type: "single",
          options: [
            { value: "structured-json", label: "Structured JSON logs" },
            { value: "plain-text", label: "Plain text logs" },
            { value: "logfmt", label: "logfmt key=value" },
          ],
        },
        {
          id: "log-library",
          label: "Logging library",
          type: "single",
          options: [
            { value: "pino", label: "Pino" },
            { value: "winston", label: "Winston" },
            { value: "structlog", label: "structlog" },
            { value: "python-logging", label: "Python stdlib logging" },
            { value: "zap", label: "Zap (Go)" },
            { value: "console", label: "console.log / stdout only" },
          ],
        },
        {
          id: "log-conventions",
          label: "Logging conventions",
          type: "multi",
          options: [
            { value: "correlation-id", label: "Every request carries a correlation/trace ID" },
            { value: "no-pii", label: "Never log PII or secrets" },
            { value: "leveled-logging", label: "Use log levels consistently (debug/info/warn/error)" },
            { value: "structured-context", label: "Attach structured context (user id, request id) not string interpolation" },
          ],
        },
      ],
    },
    {
      id: "metrics-tracing",
      title: "Metrics & tracing",
      fields: [
        {
          id: "metrics",
          label: "Metrics backend",
          type: "single",
          options: [
            { value: "prometheus", label: "Prometheus" },
            { value: "datadog", label: "Datadog" },
            { value: "cloudwatch", label: "CloudWatch Metrics" },
            { value: "grafana-cloud", label: "Grafana Cloud" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "tracing",
          label: "Distributed tracing",
          type: "single",
          options: [
            { value: "opentelemetry", label: "OpenTelemetry" },
            { value: "jaeger", label: "Jaeger" },
            { value: "datadog-apm", label: "Datadog APM" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "instrumentation",
          label: "What must be instrumented",
          type: "multi",
          options: [
            { value: "http-requests", label: "Inbound HTTP requests (latency, status codes)" },
            { value: "db-queries", label: "Database query timing" },
            { value: "external-calls", label: "Outbound third-party API calls" },
            { value: "background-jobs", label: "Background job duration/success rate" },
            { value: "business-metrics", label: "Key business/product metrics" },
          ],
        },
      ],
    },
    {
      id: "error-handling",
      title: "Error handling",
      description:
        "How failures flow through generated code and across the wire — moved here from Programming Language and API Design so the full error story (raise it, shape it, get paged about it) lives in one place next to how it's tracked.",
      fields: [
        {
          id: "error-handling-style",
          label: "Error handling style",
          type: "single",
          options: [
            {
              value: "exceptions",
              label: "Exceptions (throw / raise / try-catch)",
              description: "Failures propagate up the call stack until caught — the mainstream default for most OOP/dynamic languages.",
              recommended: true,
              compatibleWhen: [
                {
                  aspectKey: "programming-language",
                  fieldId: "language",
                  values: ["java", "csharp", "python", "ruby", "php", "kotlin", "swift", "javascript", "typescript", "lua", "perl", "r", "clojure", "dart", "objective-c"],
                },
              ],
            },
            {
              value: "result-type-optional",
              label: "Result / Either return values",
              description: "Expected failures are an explicit return value (Result<T,E>, Either, {:ok,_}/{:error,_}), not a thrown exception — reserve panics/exceptions for programmer bugs.",
              compatibleWhen: [
                { aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript", "kotlin", "swift"] },
              ],
            },
            {
              value: "result-type",
              label: "Result / Either return values",
              description: "Idiomatic here: Result/Either (or tagged {:ok,_}/{:error,_} tuples) for expected failures, panics/exceptions reserved for unrecoverable bugs.",
              recommended: true,
              compatibleWhen: [
                { aspectKey: "programming-language", fieldId: "language", values: ["rust", "scala", "fsharp", "haskell", "elixir"] },
              ],
            },
            {
              value: "error-value-return",
              label: "Explicit error-value return (value, err)",
              description: "Every fallible call returns its error alongside its result and the caller must check it explicitly — the idiomatic, effectively mandatory Go style.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go", "c"] }],
            },
            {
              value: "error-value-return-cpp",
              label: "Explicit error-value return (error codes)",
              description: "Error codes / errno-style returns instead of exceptions — still common in performance- or ABI-sensitive C++ code.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["cpp"] }],
            },
            {
              value: "exceptions-cpp",
              label: "Exceptions (throw / try-catch)",
              description: "C++'s other mainstream option — unwinds the stack on failure instead of threading an error code through every return.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["cpp"] }],
            },
          ],
        },
        {
          id: "error-shape",
          label: "API error response shape",
          type: "single",
          description: "Only relevant once an in-code failure crosses an API boundary — not applicable to a repo with no API surface.",
          // Field-level exclusion, not per-option: every option here was
          // previously tagged repos:["backend"] individually, which for a
          // frontend/mobile/infra repo empties the field entirely and
          // triggers compatibleOptions()'s "never show zero options"
          // fallback — silently showing all 4 anyway. Exact repeat of the
          // bug the ORM fields had; caught auditing this card specifically
          // because it was written before that fallback issue was found.
          repos: ["backend"],
          options: [
            { value: "rfc7807", label: "RFC 7807 Problem Details" },
            { value: "custom-envelope", label: "Custom { error: { code, message } } envelope" },
            { value: "graphql-errors", label: "GraphQL errors array with extensions.code" },
            { value: "grpc-status", label: "gRPC status codes" },
          ],
        },
      ],
    },
    {
      id: "errors-alerting",
      title: "Error tracking & alerting",
      fields: [
        {
          id: "error-tracker",
          label: "Error tracking tool",
          type: "single",
          options: [
            { value: "sentry", label: "Sentry" },
            { value: "rollbar", label: "Rollbar" },
            { value: "bugsnag", label: "Bugsnag" },
            { value: "cloud-native", label: "Cloud-native (CloudWatch/Stackdriver) only" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "alerting-channel",
          label: "Alert routing",
          type: "multi",
          options: [
            { value: "pagerduty", label: "PagerDuty" },
            { value: "opsgenie", label: "Opsgenie" },
            { value: "slack", label: "Slack channel" },
            { value: "email", label: "Email" },
          ],
        },
        {
          id: "slo-practice",
          label: "SLO / on-call practice",
          type: "multi",
          options: [
            { value: "slos-defined", label: "SLOs defined per critical service" },
            { value: "error-budget", label: "Error budget tracked" },
            { value: "runbooks", label: "Runbook linked from every alert" },
            { value: "postmortems", label: "Blameless postmortems for incidents" },
          ],
        },
      ],
    },
  ],
};
