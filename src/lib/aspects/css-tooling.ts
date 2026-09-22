import { AspectDefinition } from "./types";

export const cssTooling: AspectDefinition = {
  key: "css-tooling",
  title: "CSS Tooling",
  icon: "🎨",
  tagline: "Styling approach, design tokens, and responsive/theming conventions.",
  cards: [
    {
      id: "approach",
      title: "Styling approach",
      description: "How components are styled.",
      fields: [
        {
          id: "approach",
          label: "Primary styling method",
          type: "single",
          options: [
            { value: "tailwind", label: "Tailwind CSS" },
            { value: "css-modules", label: "CSS Modules" },
            { value: "styled-components", label: "styled-components" },
            { value: "emotion", label: "Emotion" },
            { value: "vanilla-extract", label: "vanilla-extract" },
            { value: "sass", label: "Sass/SCSS" },
            { value: "plain-css", label: "Plain CSS with BEM" },
            { value: "css-in-js-panda", label: "Panda CSS / CSS-in-JS (zero-runtime)" },
          ],
        },
        {
          id: "component-library",
          label: "Component library / design system base",
          type: "single",
          options: [
            { value: "shadcn", label: "shadcn/ui" },
            { value: "radix", label: "Radix Primitives (unstyled)" },
            { value: "mui", label: "Material UI" },
            { value: "chakra", label: "Chakra UI" },
            { value: "mantine", label: "Mantine" },
            { value: "custom", label: "Fully custom, no base library" },
            { value: "none", label: "None" },
          ],
        },
      ],
    },
    {
      id: "tokens",
      title: "Design tokens",
      description: "How visual constants are defined and shared.",
      fields: [
        {
          id: "token-source",
          label: "Token source of truth",
          type: "single",
          options: [
            { value: "css-vars", label: "CSS custom properties" },
            { value: "tailwind-theme", label: "Tailwind theme config" },
            { value: "figma-tokens", label: "Figma Tokens synced to code" },
            { value: "js-theme-object", label: "JS/TS theme object (styled-components/Chakra theme)" },
          ],
        },
        {
          id: "token-categories",
          label: "Tokens to standardize",
          type: "multi",
          options: [
            { value: "color", label: "Color palette (semantic + primitive)" },
            { value: "spacing", label: "Spacing scale" },
            { value: "typography", label: "Typography scale (font size/weight/line-height)" },
            { value: "radius", label: "Border radius scale" },
            { value: "shadow", label: "Elevation/shadow scale" },
            { value: "breakpoints", label: "Breakpoints" },
            { value: "z-index", label: "z-index scale" },
          ],
        },
      ],
    },
    {
      id: "responsive-theming",
      title: "Responsive design & theming",
      fields: [
        {
          id: "responsive-strategy",
          label: "Responsive strategy",
          type: "single",
          options: [
            { value: "mobile-first", label: "Mobile-first (min-width breakpoints)" },
            { value: "desktop-first", label: "Desktop-first (max-width breakpoints)" },
            { value: "container-queries", label: "Container queries over viewport breakpoints" },
          ],
        },
        {
          id: "theming",
          label: "Theming support",
          type: "single",
          options: [
            { value: "light-dark-auto", label: "Light + dark, following system preference" },
            { value: "light-dark-toggle", label: "Light + dark, user-toggleable and persisted" },
            { value: "light-only", label: "Light theme only" },
            { value: "multi-brand", label: "Multi-brand / white-label theming" },
          ],
        },
      ],
    },
    {
      id: "patterns",
      title: "Patterns to adopt",
      fields: [
        {
          id: "patterns",
          label: "Conventions",
          type: "multi",
          options: [
            { value: "no-inline-styles", label: "No inline style objects/attributes outside dynamic values" },
            { value: "no-magic-values", label: "No hardcoded colors/spacing — tokens only" },
            { value: "utility-first", label: "Utility-first classes over custom CSS files" },
            { value: "co-locate-styles", label: "Co-locate styles with their component" },
            { value: "a11y-focus-states", label: "Explicit, visible focus states for accessibility" },
            { value: "reduced-motion", label: "Respect prefers-reduced-motion" },
          ],
        },
      ],
    },
  ],
};
