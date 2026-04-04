export type FontCategory = "sans" | "serif" | "mono" | "script" | "display";

export interface FontOption {
  id: string;
  label: string;
  css: string;
  category: FontCategory;
  weights: number[];
  italic: boolean;
}

export const FONTS: FontOption[] = [
  {
    id: "segoe",
    label: "Segoe UI",
    css: '"Segoe UI", system-ui, -apple-system, sans-serif',
    category: "sans",
    weights: [300, 400, 600, 700],
    italic: true,
  },
  {
    id: "arial",
    label: "Arial",
    css: "Arial, Helvetica, sans-serif",
    category: "sans",
    weights: [400, 700],
    italic: true,
  },
  {
    id: "montserrat",
    label: "Montserrat",
    css: '"Montserrat", sans-serif',
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
    italic: true,
  },
  {
    id: "poppins",
    label: "Poppins",
    css: '"Poppins", sans-serif',
    category: "sans",
    weights: [300, 400, 500, 600, 700, 800, 900],
    italic: true,
  },
  {
    id: "georgia",
    label: "Georgia",
    css: "Georgia, serif",
    category: "serif",
    weights: [400, 700],
    italic: true,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    css: '"Playfair Display", Georgia, serif',
    category: "serif",
    weights: [400, 500, 600, 700, 800, 900],
    italic: true,
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    css: '"JetBrains Mono", Consolas, monospace',
    category: "mono",
    weights: [400, 500, 700, 800],
    italic: true,
  },
  {
    id: "dancing",
    label: "Dancing Script",
    css: '"Dancing Script", cursive',
    category: "script",
    weights: [400, 700],
    italic: false,
  },
  {
    id: "oswald",
    label: "Oswald",
    css: '"Oswald", sans-serif',
    category: "display",
    weights: [300, 400, 500, 600, 700],
    italic: false,
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    css: '"Bebas Neue", sans-serif',
    category: "display",
    weights: [400],
    italic: false,
  },
];

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: "sans", label: "Sans-serif" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Monospace" },
  { id: "script", label: "Script" },
  { id: "display", label: "Display" },
];

export const WEIGHT_LABELS: Record<number, string> = {
  100: "Thin",
  200: "XLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi",
  700: "Bold",
  800: "XBold",
  900: "Black",
};

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  "family=Bebas+Neue&" +
  "family=Dancing+Script:wght@400;700&" +
  "family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;0,800;1,400;1,700&" +
  "family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&" +
  "family=Oswald:wght@300;400;500;600;700&" +
  "family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&" +
  "family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&" +
  "display=swap";
