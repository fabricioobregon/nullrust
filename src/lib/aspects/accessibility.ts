import { AspectDefinition } from "./types";

export const accessibility: AspectDefinition = {
  key: "accessibility",
  title: "Accessibility",
  icon: "♿",
  tagline: "Conformance target, testing tools, and required patterns.",
  scope: ["frontend", "mobile"],
  cards: [
    {
      id: "target",
      title: "Conformance target",
      fields: [
        {
          id: "wcag-level",
          label: "Target WCAG conformance level",
          type: "single",
          options: [
            { value: "wcag-a", label: "WCAG 2.x Level A" },
            { value: "wcag-aa", label: "WCAG 2.x Level AA" },
            { value: "wcag-aaa", label: "WCAG 2.x Level AAA" },
            { value: "none-formal", label: "No formal target yet" },
          ],
        },
        {
          id: "scope",
          label: "Scope",
          type: "single",
          options: [
            { value: "entire-product", label: "Entire product" },
            { value: "public-pages-only", label: "Public-facing pages only" },
            { value: "critical-flows-only", label: "Critical user flows only (signup, checkout, etc.)" },
          ],
        },
      ],
    },
    {
      id: "testing",
      title: "Testing & verification",
      fields: [
        {
          id: "automated-tools",
          label: "Automated testing tools",
          type: "multi",
          options: [
            { value: "axe-core", label: "axe-core (jest-axe / @axe-core/playwright)" },
            { value: "lighthouse-ci", label: "Lighthouse CI accessibility audits" },
            { value: "eslint-jsx-a11y", label: "eslint-plugin-jsx-a11y" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "manual-testing",
          label: "Manual verification practices",
          type: "multi",
          options: [
            { value: "screen-reader-testing", label: "Manual screen reader testing (VoiceOver/NVDA/JAWS)" },
            { value: "keyboard-only-testing", label: "Keyboard-only navigation testing" },
            { value: "a11y-in-review-checklist", label: "Accessibility checklist as part of PR review" },
          ],
        },
        {
          id: "ci-enforcement",
          label: "CI enforcement",
          type: "single",
          options: [
            { value: "fail-build", label: "Fail the build on automated a11y violations" },
            { value: "warn-only", label: "Report violations, don't block the build" },
            { value: "none", label: "Not enforced in CI" },
          ],
        },
      ],
    },
    {
      id: "patterns",
      title: "Required patterns",
      fields: [
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "semantic-html", label: "Semantic HTML elements over div soup" },
            { value: "keyboard-navigable", label: "All interactive elements keyboard-navigable and focus-visible" },
            { value: "alt-text-required", label: "Alt text required on all meaningful images" },
            { value: "color-contrast-minimum", label: "Minimum color contrast ratios enforced by design tokens" },
            { value: "aria-only-when-needed", label: "ARIA attributes only when semantic HTML is insufficient" },
            { value: "form-labels-associated", label: "Every form input has a properly associated label" },
            { value: "reduced-motion-respected", label: "Respect prefers-reduced-motion for animations" },
          ],
        },
      ],
    },
  ],
};
