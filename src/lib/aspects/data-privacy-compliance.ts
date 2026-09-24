import { AspectDefinition } from "./types";

export const dataPrivacyCompliance: AspectDefinition = {
  key: "data-privacy-compliance",
  title: "Data Privacy & Compliance",
  icon: "🔏",
  tagline: "Applicable regulations, PII handling, retention, and consent.",
  scope: "all",
  cards: [
    {
      id: "regulations",
      title: "Applicable regulations",
      fields: [
        {
          id: "regulations",
          label: "Regulations this project must comply with",
          type: "multi",
          options: [
            { value: "gdpr", label: "GDPR (EU)" },
            { value: "ccpa-cpra", label: "CCPA/CPRA (California)" },
            { value: "hipaa", label: "HIPAA (US health data)" },
            { value: "pci-dss", label: "PCI-DSS (payment card data)" },
            { value: "soc2", label: "SOC 2" },
            { value: "none", label: "None currently applicable" },
          ],
        },
      ],
    },
    {
      id: "pii-handling",
      title: "PII classification & handling",
      fields: [
        {
          id: "pii-classification",
          label: "How PII fields are marked",
          type: "single",
          options: [
            { value: "schema-annotated", label: "Explicitly annotated in schema/types (e.g. @sensitive)" },
            { value: "naming-convention", label: "Naming convention only (e.g. _pii suffix)" },
            { value: "data-catalog", label: "Tracked in a separate data catalog/inventory" },
            { value: "none", label: "Not formally tracked" },
          ],
        },
        {
          id: "pii-handling-rules",
          label: "Handling rules to enforce",
          type: "multi",
          options: [
            { value: "encrypt-at-rest", label: "Encrypt PII at rest" },
            { value: "mask-in-non-prod", label: "Mask/anonymize PII when copying to non-prod environments" },
            { value: "no-pii-in-logs-analytics", label: "Never send PII to logs, analytics, or error trackers" },
            { value: "access-restricted", label: "Access to raw PII restricted to specific roles" },
          ],
        },
      ],
    },
    {
      id: "retention-rights",
      title: "Retention & data subject rights",
      fields: [
        {
          id: "retention-policy",
          label: "Data retention policy",
          type: "single",
          options: [
            { value: "defined-per-data-type", label: "Explicit retention period per data type" },
            { value: "indefinite-until-deletion-requested", label: "Retained indefinitely until deletion requested" },
            { value: "auto-purge-scheduled", label: "Automatic scheduled purge job" },
          ],
        },
        {
          id: "subject-rights",
          label: "Data subject rights supported",
          type: "multi",
          options: [
            { value: "right-to-erasure", label: "Right to erasure / account deletion" },
            { value: "data-export", label: "Data export / portability" },
            { value: "consent-withdrawal", label: "Consent withdrawal" },
            { value: "none-yet", label: "None implemented yet" },
          ],
        },
      ],
    },
    {
      id: "consent",
      title: "Consent management",
      fields: [
        {
          id: "consent-tool",
          label: "Consent management",
          type: "single",
          options: [
            { value: "cmp-platform", label: "Dedicated CMP (OneTrust/Cookiebot/Osano)" },
            { value: "custom-banner", label: "Custom-built consent banner + backend flag" },
            { value: "none", label: "Not applicable / no tracking requiring consent" },
          ],
        },
        {
          id: "consent-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "consent-gated-tracking", label: "No analytics/marketing scripts fire before consent" },
            { value: "granular-consent-categories", label: "Granular consent categories (necessary/analytics/marketing)" },
            { value: "consent-audit-log", label: "Audit log of consent changes" },
          ],
        },
      ],
    },
  ],
};
