import { AspectAnswers, AspectDefinition } from "./types";
import { programmingLanguage } from "./programming-language";
import { framework } from "./framework";
import { database } from "./database";
import { cssTooling } from "./css-tooling";
import { ciCd } from "./ci-cd";
import { testing } from "./testing";

// Add one entry per new aspect page here. Order controls display order.
export const aspects: AspectDefinition[] = [
  programmingLanguage,
  framework,
  database,
  cssTooling,
  ciCd,
  testing,
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
