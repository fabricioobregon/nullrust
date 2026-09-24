import { AspectDefinition } from "./types";

export const messagingBackgroundJobs: AspectDefinition = {
  key: "messaging-background-jobs",
  title: "Messaging & Background Jobs",
  icon: "📨",
  tagline: "Queues, brokers, job runners, and retry/idempotency conventions.",
  scope: ["backend", "infra"],
  cards: [
    {
      id: "messaging",
      title: "Messaging / event backbone",
      fields: [
        {
          id: "broker",
          label: "Queue / broker",
          type: "single",
          options: [
            { value: "sqs", label: "AWS SQS" },
            { value: "sns-sqs", label: "AWS SNS + SQS (pub/sub)" },
            { value: "rabbitmq", label: "RabbitMQ" },
            { value: "kafka", label: "Kafka" },
            { value: "redis-streams", label: "Redis Streams / Pub-Sub" },
            { value: "gcp-pubsub", label: "Google Cloud Pub/Sub" },
            { value: "none", label: "None — synchronous only" },
          ],
        },
        {
          id: "messaging-pattern",
          label: "Messaging pattern",
          type: "single",
          options: [
            { value: "point-to-point", label: "Point-to-point queue (work distribution)" },
            { value: "pub-sub", label: "Pub/sub fan-out" },
            { value: "event-sourcing", label: "Event sourcing / event log as source of truth" },
          ],
        },
      ],
    },
    {
      id: "background-jobs",
      title: "Background jobs",
      fields: [
        {
          id: "job-runner",
          label: "Background job runner",
          type: "single",
          options: [
            { value: "bullmq", label: "BullMQ" },
            { value: "sidekiq", label: "Sidekiq" },
            { value: "celery", label: "Celery" },
            { value: "cloud-tasks", label: "Cloud Tasks / managed queue-triggered functions" },
            { value: "cron-scripts", label: "Cron-triggered scripts" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "job-types",
          label: "What runs as background jobs",
          type: "multi",
          options: [
            { value: "emails-notifications", label: "Emails / notifications" },
            { value: "data-exports", label: "Data exports / reports" },
            { value: "third-party-sync", label: "Third-party sync/webhooks processing" },
            { value: "scheduled-maintenance", label: "Scheduled maintenance/cleanup tasks" },
          ],
        },
      ],
    },
    {
      id: "reliability",
      title: "Reliability conventions",
      fields: [
        {
          id: "reliability-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "idempotent-handlers", label: "Idempotent message/job handlers" },
            { value: "dead-letter-queue", label: "Dead-letter queue for failed messages" },
            { value: "exponential-backoff", label: "Exponential backoff with jitter on retry" },
            { value: "at-least-once-assumed", label: "Design for at-least-once delivery (no exactly-once assumption)" },
            { value: "outbox-pattern", label: "Transactional outbox pattern for DB + message consistency" },
          ],
        },
        {
          id: "max-retries",
          label: "Max retry attempts before dead-lettering",
          type: "single",
          options: [
            { value: "3", label: "3" },
            { value: "5", label: "5" },
            { value: "10", label: "10" },
            { value: "unlimited-manual", label: "Unlimited, manual intervention required" },
          ],
        },
      ],
    },
  ],
};
