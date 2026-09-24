import { AspectDefinition } from "./types";

export const infrastructure: AspectDefinition = {
  key: "infrastructure",
  title: "Infrastructure",
  icon: "🏗️",
  tagline: "Containerization, orchestration, IaC, and environment strategy.",
  scope: ["infra"],
  cards: [
    {
      id: "runtime",
      title: "Runtime & containerization",
      fields: [
        {
          id: "containerization",
          label: "Containerization",
          type: "single",
          options: [
            { value: "docker", label: "Docker" },
            { value: "none-serverless", label: "None — serverless/managed platform" },
            { value: "buildpacks", label: "Cloud Native Buildpacks" },
          ],
        },
        {
          id: "orchestration",
          label: "Orchestration / hosting model",
          type: "single",
          options: [
            { value: "kubernetes", label: "Kubernetes" },
            { value: "ecs", label: "AWS ECS/Fargate" },
            { value: "cloud-run", label: "Google Cloud Run" },
            { value: "serverless-functions", label: "Serverless functions (Lambda/Vercel/Workers)" },
            { value: "paas", label: "PaaS (Railway/Render/Heroku)" },
            { value: "vms", label: "Plain VMs" },
          ],
        },
      ],
    },
    {
      id: "iac",
      title: "Infrastructure as code",
      fields: [
        {
          id: "iac-tool",
          label: "IaC tool",
          type: "single",
          options: [
            { value: "terraform", label: "Terraform" },
            { value: "pulumi", label: "Pulumi" },
            { value: "cdk", label: "AWS CDK" },
            { value: "cloudformation", label: "CloudFormation" },
            { value: "console-managed", label: "Manually managed via cloud console" },
          ],
        },
        {
          id: "iac-practices",
          label: "Practices to adopt",
          type: "multi",
          options: [
            { value: "plan-review-required", label: "Plan/diff reviewed before apply" },
            { value: "state-remote-locked", label: "Remote state with locking" },
            { value: "modules-reused", label: "Reusable modules, no copy-pasted stacks" },
            { value: "drift-detection", label: "Scheduled drift detection" },
          ],
        },
      ],
    },
    {
      id: "environments",
      title: "Environment strategy",
      fields: [
        {
          id: "environment-tiers",
          label: "Environment tiers",
          type: "multi",
          options: [
            { value: "local", label: "local" },
            { value: "dev", label: "dev" },
            { value: "staging", label: "staging" },
            { value: "prod", label: "production" },
            { value: "ephemeral-per-pr", label: "ephemeral per-PR environments" },
          ],
        },
        {
          id: "config-management",
          label: "Configuration management",
          type: "single",
          options: [
            { value: "env-vars-per-environment", label: "Env vars scoped per environment" },
            { value: "config-service", label: "Central config service (Consul/AppConfig)" },
            { value: "feature-flags-runtime", label: "Runtime feature flags for environment-specific behavior" },
          ],
        },
        {
          id: "scaling",
          label: "Scaling approach",
          type: "single",
          options: [
            { value: "autoscaling", label: "Autoscaling based on load metrics" },
            { value: "fixed-capacity", label: "Fixed capacity, manually adjusted" },
            { value: "scale-to-zero", label: "Scale-to-zero serverless" },
          ],
        },
      ],
    },
  ],
};
