import { AspectDefinition } from "./types";

export const analytics: AspectDefinition = {
  key: "analytics",
  title: "Analytics",
  icon: "📈",
  tagline: "Product analytics tooling, event conventions, and tracking patterns.",
  scope: ["backend", "frontend", "mobile"],
  cards: [
    {
      id: "tooling",
      title: "Analytics tooling",
      fields: [
        {
          id: "tool",
          label: "Product analytics tool",
          type: "single",
          options: [
            { value: "segment", label: "Segment (CDP)" },
            { value: "amplitude", label: "Amplitude" },
            { value: "mixpanel", label: "Mixpanel" },
            { value: "posthog", label: "PostHog" },
            { value: "google-analytics", label: "Google Analytics" },
            { value: "custom-warehouse", label: "Custom, events shipped straight to a data warehouse" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "destinations",
          label: "Where events flow",
          type: "multi",
          options: [
            { value: "warehouse", label: "Data warehouse (for BI/SQL analysis)" },
            { value: "product-analytics-tool", label: "Product analytics tool (funnels/dashboards)" },
            { value: "marketing-tools", label: "Marketing/CRM tools" },
          ],
        },
      ],
    },
    {
      id: "event-conventions",
      title: "Event conventions",
      fields: [
        {
          id: "naming-convention",
          label: "Event naming convention",
          type: "single",
          options: [
            { value: "object-action", label: "Object + past-tense action (e.g. Order Completed)" },
            { value: "snake_case_events", label: "snake_case event names" },
            { value: "namespaced", label: "Namespaced (e.g. checkout.order_completed)" },
          ],
        },
        {
          id: "tracking-plan",
          label: "Tracking plan governance",
          type: "single",
          options: [
            { value: "central-tracking-plan", label: "Central tracking plan (spreadsheet/tool), reviewed before shipping new events" },
            { value: "code-defined-schema", label: "Event schemas defined and typed in code" },
            { value: "ad-hoc", label: "Ad hoc, no central plan" },
          ],
        },
      ],
    },
    {
      id: "what-to-track",
      title: "What must be tracked",
      fields: [
        {
          id: "required-tracking",
          label: "Required tracking",
          type: "multi",
          options: [
            { value: "signup-funnel", label: "Signup/onboarding funnel" },
            { value: "activation-events", label: "Activation / first-value milestones" },
            { value: "conversion-revenue-events", label: "Conversion / revenue events" },
            { value: "feature-adoption", label: "Feature adoption for major features" },
            { value: "error-friction-events", label: "User-facing errors / friction points" },
          ],
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy-conscious tracking",
      fields: [
        {
          id: "privacy-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "consent-gated", label: "No tracking scripts fire before consent is given" },
            { value: "no-pii-in-events", label: "Never include PII in event payloads, use hashed/opaque IDs" },
            { value: "server-side-tracking", label: "Prefer server-side tracking over client-side where possible" },
            { value: "sampling-for-high-volume", label: "Sample high-volume, low-value events instead of tracking every occurrence" },
          ],
        },
      ],
    },
  ],
};
