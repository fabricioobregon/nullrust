import { AspectAnswers, AspectDefinition } from "./types";
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

// Add one entry per new aspect page here. Order controls display order.
export const aspects: AspectDefinition[] = [
  programmingLanguage,
  framework,
  database,
  cssTooling,
  ciCd,
  testing,
  observability,
  apiDesign,
  auth,
  security,
  lintingFormatting,
  gitWorkflow,
  infrastructure,
  caching,
  messagingBackgroundJobs,
  documentation,
  dataValidationState,
  packageManagement,
  dataPrivacyCompliance,
  accessibility,
  featureFlags,
  analytics,
  backupDisasterRecovery,
  i18nLocalization,
];

export function getAspect(key: string): AspectDefinition | undefined {
  return aspects.find((a) => a.key === key);
}

export function fieldCount(aspect: AspectDefinition): number {
  return aspect.cards.reduce((sum, card) => sum + card.fields.length, 0);
}

export function answeredFieldCount(aspect: AspectDefinition, answers: AspectAnswers): number {
  let count = 0;
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      const value = answers[field.id];
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      count++;
    }
  }
  return count;
}
