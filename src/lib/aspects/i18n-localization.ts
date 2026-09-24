import { AspectDefinition } from "./types";

export const i18nLocalization: AspectDefinition = {
  key: "i18n-localization",
  title: "Internationalization & Localization",
  icon: "🌍",
  tagline: "Translation tooling, locale strategy, and what must be localized.",
  cards: [
    {
      id: "tooling",
      title: "Translation tooling",
      fields: [
        {
          id: "library",
          label: "i18n library",
          type: "single",
          options: [
            { value: "i18next", label: "i18next" },
            { value: "react-intl", label: "react-intl / FormatJS" },
            { value: "next-intl", label: "next-intl" },
            { value: "rails-i18n", label: "Rails I18n" },
            { value: "django-i18n", label: "Django i18n" },
            { value: "none", label: "None — single locale only" },
          ],
        },
        {
          id: "translation-workflow",
          label: "Translation workflow",
          type: "single",
          options: [
            { value: "in-repo-json", label: "In-repo JSON/YAML files, translated via PR" },
            { value: "tms-lokalise-crowdin", label: "Translation Management System (Lokalise/Crowdin/Phrase)" },
            { value: "machine-translation-reviewed", label: "Machine-translated, human-reviewed before release" },
          ],
        },
      ],
    },
    {
      id: "locale-strategy",
      title: "Locale strategy",
      fields: [
        {
          id: "detection",
          label: "Locale detection",
          type: "single",
          options: [
            { value: "url-path-prefix", label: "URL path prefix (/en/, /es/)" },
            { value: "subdomain", label: "Subdomain (en.example.com)" },
            { value: "accept-language-header", label: "Accept-Language header, no URL change" },
            { value: "user-setting", label: "Explicit user account setting" },
          ],
        },
        {
          id: "supported-locales",
          label: "Supported locales",
          type: "text",
          placeholder: "e.g. en-US, es-MX, pt-BR, fr-FR",
        },
        {
          id: "fallback-locale",
          label: "Fallback locale policy",
          type: "single",
          options: [
            { value: "single-fallback", label: "Single default fallback locale for missing keys" },
            { value: "fail-loud-missing-key", label: "Fail loudly / flag missing translation keys" },
          ],
        },
      ],
    },
    {
      id: "what-to-localize",
      title: "What must be localized",
      fields: [
        {
          id: "localization-scope",
          label: "Localization scope",
          type: "multi",
          options: [
            { value: "dates-times", label: "Dates and times" },
            { value: "numbers-currency", label: "Numbers and currency formatting" },
            { value: "pluralization", label: "Pluralization rules" },
            { value: "rtl-support", label: "Right-to-left (RTL) layout support" },
            { value: "images-with-text", label: "Images/graphics containing text" },
          ],
        },
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "no-hardcoded-strings", label: "No hardcoded user-facing strings in components" },
            { value: "no-string-concatenation", label: "No string concatenation for translated sentences (breaks grammar)" },
            { value: "translation-keys-namespaced", label: "Translation keys namespaced by feature/page" },
            { value: "locale-aware-formatting-apis", label: "Use locale-aware Intl APIs, not manual formatting" },
          ],
        },
      ],
    },
  ],
};
