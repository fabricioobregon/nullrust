import { AspectDefinition } from "./types";

export const ciCd: AspectDefinition = {
  key: "ci-cd",
  title: "CI/CD",
  icon: "🚀",
  tagline: "Pipeline provider, required checks, and deployment strategy.",
  cards: [
    {
      id: "provider",
      title: "CI/CD provider",
      fields: [
        {
          id: "provider",
          label: "Provider",
          type: "single",
          options: [
            { value: "github-actions", label: "GitHub Actions" },
            { value: "gitlab-ci", label: "GitLab CI" },
            { value: "circleci", label: "CircleCI" },
            { value: "jenkins", label: "Jenkins" },
            { value: "buildkite", label: "Buildkite" },
            { value: "azure-devops", label: "Azure DevOps Pipelines" },
            { value: "argo", label: "Argo Workflows" },
          ],
        },
      ],
    },
    {
      id: "pipeline",
      title: "Pipeline stages & checks",
      description: "What must run and pass before code merges or deploys.",
      fields: [
        {
          id: "required-checks",
          label: "Required checks before merge",
          type: "multi",
          options: [
            { value: "lint", label: "Lint" },
            { value: "typecheck", label: "Type check" },
            { value: "unit-tests", label: "Unit tests" },
            { value: "integration-tests", label: "Integration tests" },
            { value: "e2e-tests", label: "End-to-end tests" },
            { value: "build", label: "Production build succeeds" },
            { value: "security-scan", label: "Dependency/security scan" },
            { value: "coverage-threshold", label: "Coverage threshold met" },
          ],
        },
        {
          id: "pipeline-triggers",
          label: "Pipeline triggers",
          type: "multi",
          options: [
            { value: "on-pr", label: "Every pull request" },
            { value: "on-merge-main", label: "On merge to main" },
            { value: "on-tag", label: "On version tag" },
            { value: "nightly", label: "Scheduled nightly run" },
          ],
        },
      ],
    },
    {
      id: "deployment",
      title: "Deployment strategy",
      fields: [
        {
          id: "strategy",
          label: "Release strategy",
          type: "single",
          options: [
            { value: "rolling", label: "Rolling deployment" },
            { value: "blue-green", label: "Blue-green deployment" },
            { value: "canary", label: "Canary release" },
            { value: "recreate", label: "Recreate (full downtime swap)" },
            { value: "feature-flags", label: "Continuous deploy behind feature flags" },
          ],
        },
        {
          id: "environments",
          label: "Environment pipeline",
          type: "multi",
          options: [
            { value: "dev", label: "dev" },
            { value: "staging", label: "staging" },
            { value: "preview", label: "per-PR preview environments" },
            { value: "prod", label: "production" },
          ],
        },
        {
          id: "rollback",
          label: "Rollback approach",
          type: "single",
          options: [
            { value: "auto-rollback", label: "Automatic rollback on health-check failure" },
            { value: "manual-rollback", label: "Manual rollback via re-deploying previous artifact" },
            { value: "revert-forward", label: "Revert commit and re-deploy (no rollback tooling)" },
          ],
        },
      ],
    },
    {
      id: "versioning",
      title: "Branching & versioning",
      fields: [
        {
          id: "versioning-scheme",
          label: "Versioning scheme",
          type: "single",
          options: [
            { value: "semver", label: "Semantic Versioning (semver)" },
            { value: "calver", label: "Calendar Versioning (calver)" },
            { value: "trunk-sha", label: "Trunk-based, deploy by commit SHA (no version numbers)" },
          ],
        },
        {
          id: "release-automation",
          label: "Release automation",
          type: "multi",
          options: [
            { value: "changesets", label: "Changesets" },
            { value: "semantic-release", label: "semantic-release" },
            { value: "release-please", label: "release-please" },
            { value: "manual-changelog", label: "Manually maintained CHANGELOG" },
          ],
        },
      ],
    },
  ],
};
