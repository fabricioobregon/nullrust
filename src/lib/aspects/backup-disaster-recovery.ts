import { AspectDefinition } from "./types";

export const backupDisasterRecovery: AspectDefinition = {
  key: "backup-disaster-recovery",
  title: "Backup & Disaster Recovery",
  icon: "💾",
  tagline: "Backup cadence, recovery targets, and failover strategy.",
  cards: [
    {
      id: "backups",
      title: "Backup strategy",
      fields: [
        {
          id: "cadence",
          label: "Backup cadence",
          type: "single",
          options: [
            { value: "continuous", label: "Continuous (point-in-time recovery)" },
            { value: "hourly", label: "Hourly snapshots" },
            { value: "daily", label: "Daily snapshots" },
            { value: "weekly", label: "Weekly snapshots" },
          ],
        },
        {
          id: "backup-scope",
          label: "What's backed up",
          type: "multi",
          options: [
            { value: "primary-database", label: "Primary database" },
            { value: "object-storage-files", label: "Object storage / uploaded files" },
            { value: "config-secrets", label: "Configuration and secrets (encrypted)" },
            { value: "infrastructure-state", label: "Infrastructure-as-code state" },
          ],
        },
        {
          id: "backup-storage",
          label: "Backup storage location",
          type: "single",
          options: [
            { value: "cross-region", label: "Cross-region, separate from primary" },
            { value: "cross-account", label: "Cross-account/cloud, isolated from primary access" },
            { value: "same-region-only", label: "Same region as primary only" },
          ],
        },
      ],
    },
    {
      id: "recovery-targets",
      title: "Recovery targets",
      fields: [
        {
          id: "rpo",
          label: "Recovery Point Objective (max acceptable data loss)",
          type: "single",
          options: [
            { value: "near-zero", label: "Near-zero (continuous replication)" },
            { value: "under-1-hour", label: "Under 1 hour" },
            { value: "under-24-hours", label: "Under 24 hours" },
            { value: "undefined", label: "Not formally defined" },
          ],
        },
        {
          id: "rto",
          label: "Recovery Time Objective (max acceptable downtime)",
          type: "single",
          options: [
            { value: "under-15-min", label: "Under 15 minutes" },
            { value: "under-1-hour", label: "Under 1 hour" },
            { value: "under-24-hours", label: "Under 24 hours" },
            { value: "undefined", label: "Not formally defined" },
          ],
        },
      ],
    },
    {
      id: "practice",
      title: "Restore testing & failover",
      fields: [
        {
          id: "restore-testing",
          label: "Restore testing practice",
          type: "single",
          options: [
            { value: "scheduled-restore-drills", label: "Scheduled periodic restore drills" },
            { value: "tested-after-major-changes", label: "Tested after major infra/schema changes" },
            { value: "never-tested", label: "Backups exist but restores have never been tested" },
          ],
        },
        {
          id: "failover-strategy",
          label: "Failover strategy",
          type: "single",
          options: [
            { value: "automatic-multi-region", label: "Automatic multi-region/multi-AZ failover" },
            { value: "manual-runbook", label: "Manual failover via documented runbook" },
            { value: "none", label: "No failover strategy yet — single point of failure accepted" },
          ],
        },
      ],
    },
  ],
};
