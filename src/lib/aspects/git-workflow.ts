import { AspectDefinition } from "./types";

export const gitWorkflow: AspectDefinition = {
  key: "git-workflow",
  title: "Git Workflow",
  icon: "🌿",
  tagline: "Branching model, review requirements, and merge strategy.",
  cards: [
    {
      id: "branching",
      title: "Branching model",
      fields: [
        {
          id: "model",
          label: "Branching model",
          type: "single",
          options: [
            { value: "trunk-based", label: "Trunk-based development (short-lived branches into main)" },
            { value: "git-flow", label: "Git Flow (develop/release/hotfix branches)" },
            { value: "github-flow", label: "GitHub Flow (feature branches, deploy from main)" },
            { value: "release-branches", label: "Long-lived release branches per version" },
          ],
        },
        {
          id: "branch-naming",
          label: "Branch naming convention",
          type: "single",
          options: [
            { value: "type-slug", label: "<type>/<short-slug> (feat/add-login)" },
            { value: "ticket-id", label: "<ticket-id>-<slug> (PROJ-123-add-login)" },
            { value: "author-slug", label: "<author>/<slug>" },
            { value: "freeform", label: "No enforced convention" },
          ],
        },
      ],
    },
    {
      id: "review",
      title: "Review requirements",
      fields: [
        {
          id: "min-approvals",
          label: "Minimum approvals to merge",
          type: "single",
          options: [
            { value: "0", label: "None required" },
            { value: "1", label: "1 approval" },
            { value: "2", label: "2 approvals" },
            { value: "codeowners", label: "CODEOWNERS-based required reviewers" },
          ],
        },
        {
          id: "review-practices",
          label: "Review practices",
          type: "multi",
          options: [
            { value: "no-self-merge", label: "No self-merging own PRs" },
            { value: "small-prs", label: "Prefer small, focused PRs over large ones" },
            { value: "pr-template", label: "PR description template required" },
            { value: "linked-issue", label: "PR must link a tracked issue/ticket" },
            { value: "ci-green-required", label: "CI must be green before review starts" },
          ],
        },
      ],
    },
    {
      id: "merging",
      title: "Merge strategy",
      fields: [
        {
          id: "merge-strategy",
          label: "How PRs are merged",
          type: "single",
          options: [
            { value: "squash", label: "Squash and merge" },
            { value: "rebase", label: "Rebase and merge" },
            { value: "merge-commit", label: "Standard merge commit" },
          ],
        },
        {
          id: "protection-rules",
          label: "Branch protection",
          type: "multi",
          options: [
            { value: "no-force-push-main", label: "No force-push to main/protected branches" },
            { value: "require-up-to-date", label: "Require branch up to date before merge" },
            { value: "require-linear-history", label: "Require linear history" },
            { value: "no-direct-commits", label: "No direct commits to protected branches" },
          ],
        },
      ],
    },
  ],
};
