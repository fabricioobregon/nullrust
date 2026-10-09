import { AspectDefinition } from "./types";
import { programmingLanguage } from "./programming-language";
import { framework } from "./framework";
import { database } from "./database";
import { cssTooling } from "./css-tooling";
import { ciCd } from "./ci-cd";
import { testing } from "./testing";
import { observability } from "./observability";
import { apiDesign } from "./api-design";
import { auth } from "./auth";
import { security } from "./security";
import { lintingFormatting } from "./linting-formatting";
import { gitWorkflow } from "./git-workflow";
import { infrastructure } from "./infrastructure";
import { caching } from "./caching";
import { messagingBackgroundJobs } from "./messaging-background-jobs";
import { documentation } from "./documentation";
import { dataValidationState } from "./data-validation-state";
import { packageManagement } from "./package-management";
import { dataPrivacyCompliance } from "./data-privacy-compliance";
import { accessibility } from "./accessibility";
import { featureFlags } from "./feature-flags";
import { analytics } from "./analytics";
import { backupDisasterRecovery } from "./backup-disaster-recovery";
import { i18nLocalization } from "./i18n-localization";

// The authored source for the aspect/card/field/option registry — the one
// place a human edits. Not read directly by the running app: it's seeded
// into the Aspect table on every deploy (see package.json's `prestart` and
// scripts/seed-aspects.ts) and src/lib/aspects/registry.ts reads the
// cached, DB-backed copy from there instead. scripts/verify-registry.ts
// validates this file specifically, before it ever gets seeded.
//
// Order controls display order, grouped by how a team would actually move
// through them — and constrained by compatibleWhen dependencies: an aspect
// referenced by another aspect's rule must come at or before it (enforced
// by scripts/verify-registry.ts, not just this comment).
//
//  1. Core stack (drives cascading for everything below):
//     Language -> Framework -> Database.
//  2. Access & interface — promoted earlier per explicit request: how the
//     system is reached and secured, right after the stack that decides it.
//     Auth and Caching both depend on Database (an engine-specific option
//     each), so this is as early as they can go; API Design has no
//     dependency but reads naturally alongside them. Security grouped in
//     for the same reason, even though nothing forces its position.
//  3. Quality & delivery practices: Testing, Linting, CI/CD, Git workflow.
//  4. Operations: Observability, Infrastructure, Messaging/jobs, Backup/DR.
//  5. Frontend-specific: CSS tooling, Frontend state & forms, Accessibility,
//     i18n.
//  6. Project hygiene: Package management, Documentation, Privacy/compliance.
//  7. Product/growth: Feature flags, Analytics.
export const aspects: AspectDefinition[] = [
  programmingLanguage,
  framework,
  database,
  auth,
  apiDesign,
  caching,
  security,
  testing,
  lintingFormatting,
  ciCd,
  gitWorkflow,
  observability,
  infrastructure,
  messagingBackgroundJobs,
  backupDisasterRecovery,
  cssTooling,
  dataValidationState,
  accessibility,
  i18nLocalization,
  packageManagement,
  documentation,
  dataPrivacyCompliance,
  featureFlags,
  analytics,
];
