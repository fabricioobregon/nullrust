import { AspectDefinition } from "./types";

export const observability: AspectDefinition = {
  key: "observability",
  title: "Observability",
  icon: "📡",
  tagline: "Logging, metrics, tracing, error tracking, and alerting.",
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
