export type FieldOption = {
  value: string;
  label: string;
  description?: string;
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
  cards: AspectCard[];
};

/** Saved answers for one aspect, keyed by field id. Multi fields store string[]. */
export type AspectAnswers = Record<string, string | string[] | undefined>;
