import { RepoKey } from "@/lib/repos";

/**
 * An option is only offered when the referenced field (elsewhere in the same
 * aspect, or in a different aspect, e.g. "programming-language.language")
 * currently holds one of `values`. See compatibility.ts for how these
 * combine across multiple rules and cascade through multiple upstream
 * fields (e.g. an ORM option gated on both a language AND a framework).
 */
export type CompatibilityRule = {
  aspectKey: string;
  fieldId: string;
  values: string[];
};

export type FieldOption = {
  value: string;
  label: string;
  description?: string;
  /** ALL rules must pass (AND) for this option to be shown. */
  compatibleWhen?: CompatibilityRule[];
  /**
   * Restricts this option to specific repo tabs (e.g. a mobile-native
   * framework shouldn't appear on the Frontend tab even if the language
   * matches). Omit to allow it on every repo the aspect itself is scoped to.
   * This is a hard structural boundary, not a progressive narrowing like
   * compatibleWhen — it's enforced unconditionally and never relaxed by the
   * "show everything" fallback that compatibleWhen uses for rule gaps.
   */
  repos?: RepoKey[];
  /** Relative visual size when the field's `display` is "cloud". Default "md". */
  weight?: "xl" | "lg" | "md" | "sm";
  /**
   * Arbitrary category label for `display: "cloud"` fields — options
   * sharing the same string get the same background tint, assigned by
   * order of first appearance (not hardcoded to any particular domain's
   * category names).
   */
  group?: string;
  /** Inline logo rendered instead of (plain-text) `label` in a cloud display. */
  icon?: { path: string; hex: string };
};

export type AspectField = {
  id: string;
  label: string;
  description?: string;
  type: "single" | "multi" | "text";
  /** Required for "single" and "multi" field types. */
  options?: FieldOption[];
  placeholder?: string;
  /**
   * "cloud" renders a "single" field's options as a scattered, varied-size
   * word cloud (hover to grow/highlight, no visible checkbox/radio) instead
   * of the default pill row. Opt-in per field — everything else keeps the
   * plain pill UI.
   */
  display?: "cloud";
};

/** One card rendered on an aspect page, grouping related fields. */
export type AspectCard = {
  id: string;
  title: string;
  description?: string;
  fields: AspectField[];
};

/** One page: a single facet of an enterprise-grade codebase (database, CI/CD, ...). */
export type AspectDefinition = {
  key: string;
  title: string;
  icon: string;
  tagline: string;
  /** Which repo(s) this aspect applies to. "all" shows it under every repo tab. */
  scope: RepoKey[] | "all";
  cards: AspectCard[];
};

/** Saved answers for one aspect, keyed by field id. Multi fields store string[]. */
export type AspectAnswers = Record<string, string | string[] | undefined>;
