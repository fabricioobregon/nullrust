import { AspectDefinition } from "./types";

export const testing: AspectDefinition = {
  key: "testing",
  title: "Testing",
  icon: "🧪",
  tagline: "Test frameworks, coverage bar, and test-writing conventions.",
  scope: "all",
  cards: [
    {
      id: "frameworks",
      title: "Test frameworks",
      fields: [
        {
          id: "unit-framework",
          label: "Unit test framework",
          type: "single",
          options: [
            {
              value: "vitest",
              label: "Vitest",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "jest",
              label: "Jest",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "pytest",
              label: "pytest",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "go-test",
              label: "go test",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["go"] }],
            },
            {
              value: "junit",
              label: "JUnit",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["java", "kotlin"] }],
            },
            {
              value: "rspec",
              label: "RSpec",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["ruby"] }],
            },
            {
              value: "xunit",
              label: "xUnit / NUnit",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["csharp"] }],
            },
          ],
        },
        {
          id: "e2e-framework",
          label: "End-to-end / browser test framework",
          type: "single",
          options: [
            { value: "playwright", label: "Playwright" },
            { value: "cypress", label: "Cypress" },
            { value: "selenium", label: "Selenium" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "component-testing",
          label: "Component testing tools",
          type: "multi",
          options: [
            { value: "testing-library", label: "Testing Library (React/Vue/etc.)" },
            { value: "storybook-interaction", label: "Storybook interaction tests" },
            { value: "enzyme", label: "Enzyme" },
          ],
        },
      ],
    },
    {
      id: "coverage",
      title: "Coverage & scope",
      fields: [
        {
          id: "coverage-threshold",
          label: "Minimum coverage threshold",
          type: "single",
          options: [
            { value: "none", label: "No enforced threshold" },
            { value: "60", label: "60%" },
            { value: "80", label: "80%" },
            { value: "90", label: "90%+" },
            { value: "critical-paths-only", label: "No global %, but critical paths must be covered" },
          ],
        },
        {
          id: "test-pyramid",
          label: "Test mix philosophy",
          type: "single",
          options: [
            { value: "pyramid", label: "Classic pyramid — mostly unit, some integration, few e2e" },
            { value: "trophy", label: "Testing trophy — emphasize integration tests" },
            { value: "e2e-heavy", label: "E2E-heavy for critical user flows" },
          ],
        },
      ],
    },
    {
      id: "test-data",
      title: "Test data strategy",
      fields: [
        {
          id: "data-strategy",
          label: "How test data is produced",
          type: "multi",
          options: [
            { value: "factories", label: "Factory functions/libraries (factory_boy, fishery)" },
            { value: "fixtures", label: "Static fixture files" },
            { value: "builders", label: "Test data builder pattern" },
            { value: "real-db-in-memory", label: "Real DB engine, ephemeral/in-memory instance" },
            { value: "mocked-db", label: "Mocked/stubbed data layer" },
          ],
        },
        {
          id: "isolation",
          label: "Test isolation",
          type: "single",
          options: [
            { value: "transaction-rollback", label: "Wrap each test in a transaction, roll back after" },
            { value: "fresh-db-per-run", label: "Fresh database per test run" },
            { value: "shared-state-ok", label: "Shared state acceptable, tests clean up after themselves" },
          ],
        },
      ],
    },
    {
      id: "conventions",
      title: "Conventions to adopt",
      fields: [
        {
          id: "patterns",
          label: "Patterns",
          type: "multi",
          options: [
            { value: "colocate-tests", label: "Colocate test files next to source (*.test.ts)" },
            { value: "separate-test-dir", label: "Separate top-level test directory mirroring src" },
            { value: "arrange-act-assert", label: "Arrange-Act-Assert structure in every test" },
            { value: "no-conditional-logic", label: "No conditional logic/loops inside tests" },
            { value: "one-assertion-focus", label: "One behavior under test per test case" },
            { value: "mock-external-only", label: "Mock only external/third-party boundaries, not internal collaborators" },
          ],
        },
      ],
    },
  ],
};
