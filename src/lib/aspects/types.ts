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
};

export type AspectField = {
  id: string;
  label: string;
  description?: string;
  type: "single" | "multi" | "text";
  /** Required for "single" and "multi" field types. */
  options?: FieldOption[];
  placeholder?: string;
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
