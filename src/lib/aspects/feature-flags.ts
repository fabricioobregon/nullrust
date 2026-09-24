import { AspectDefinition } from "./types";

export const featureFlags: AspectDefinition = {
  key: "feature-flags",
  title: "Feature Flags",
  icon: "🚩",
  tagline: "Flag platform, rollout strategy, and flag lifecycle.",
  scope: "all",
  cards: [
    {
      id: "platform",
      title: "Flag platform",
      fields: [
        {
          id: "platform",
          label: "Feature flag platform",
          type: "single",
          options: [
            { value: "launchdarkly", label: "LaunchDarkly" },
            { value: "unleash", label: "Unleash" },
            { value: "flagsmith", label: "Flagsmith" },
            { value: "growthbook", label: "GrowthBook" },
            { value: "split", label: "Split" },
            { value: "homegrown", label: "Homegrown (DB-backed flags)" },
            { value: "env-vars-only", label: "Environment variables only, no runtime toggling" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "evaluation-point",
          label: "Where flags are evaluated",
          type: "single",
          options: [
            { value: "server-only", label: "Server-side only" },
            { value: "client-only", label: "Client-side only" },
            { value: "both", label: "Both, with server as source of truth" },
          ],
        },
      ],
    },
    {
      id: "rollout",
      title: "Rollout strategy",
      fields: [
        {
          id: "rollout-strategies",
          label: "Rollout strategies used",
          type: "multi",
          options: [
            { value: "percentage-rollout", label: "Percentage-based gradual rollout" },
            { value: "ring-based", label: "Ring-based (internal → beta → GA)" },
            { value: "user-targeting", label: "Targeted by user attribute/segment" },
            { value: "kill-switch", label: "Kill switches for risky features" },
          ],
        },
        {
          id: "flag-types",
          label: "Flag types in use",
          type: "multi",
          options: [
            { value: "release-flags", label: "Release flags (temporary, for shipping in progress)" },
            { value: "ops-flags", label: "Ops flags (circuit breakers, kill switches)" },
            { value: "experiment-flags", label: "Experiment flags (A/B testing)" },
            { value: "permission-flags", label: "Permission/entitlement flags (plan-based features)" },
          ],
        },
      ],
    },
    {
      id: "lifecycle",
      title: "Flag lifecycle & hygiene",
      fields: [
        {
          id: "cleanup-policy",
          label: "Flag cleanup policy",
          type: "single",
          options: [
            { value: "remove-after-full-rollout", label: "Removed from code immediately after reaching 100% rollout" },
            { value: "tracked-with-expiry", label: "Tracked with an expiry date, alerted when stale" },
            { value: "no-formal-policy", label: "No formal cleanup policy yet" },
          ],
        },
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "flags-in-version-control", label: "Flag definitions/defaults tracked in version control" },
            { value: "default-to-off", label: "New flags default to off" },
            { value: "no-nested-flag-logic", label: "No deeply nested/combinatorial flag conditionals" },
            { value: "flag-owner-required", label: "Every flag has a named owner and purpose documented" },
          ],
        },
      ],
    },
  ],
};
