import {
  BrainCircuit,
  CheckSquare,
  Gamepad2,
  Layers3,
  Rocket,
  TimerReset,
} from "lucide-react";

import type { CatalogItem, IconMap } from "@/types/catalog";

export const iconMap: IconMap = {
  BrainCircuit,
  CheckSquare,
  Gamepad2,
  Layers3,
  Rocket,
  TimerReset,
};

export const catalogItems: CatalogItem[] = [
  {
    slug: "blackjack",
    title: "Blackjack Reboot",
    description:
      "A cleaned-up blackjack experience with typed game logic, better score handling and a modern UI.",
    href: "/games/blackjack",
    category: "game",
    status: "live",
    iconName: "Gamepad2",
    tags: ["Cards", "Logic", "Single-player"],
    ctaLabel: "Play now",
    featured: true,
  },
  {
    slug: "todos",
    title: "Todos Hub",
    description:
      "Task management with local persistence today and a data model ready for user sync later.",
    href: "/apps/todos",
    category: "app",
    status: "live",
    iconName: "CheckSquare",
    tags: ["Productivity", "Local sync", "MVP"],
    ctaLabel: "Open app",
    featured: true,
  },
  {
    slug: "pomodoro",
    title: "Pomodoro Flow",
    description:
      "A focused work timer with future support for profiles, saved sessions and streak tracking.",
    href: "/apps",
    category: "app",
    status: "coming-soon",
    iconName: "TimerReset",
    tags: ["Focus", "Timer", "Coming soon"],
    ctaLabel: "Coming soon",
  },
  {
    slug: "lab",
    title: "UI Motion Lab",
    description:
      "A place for small interactive experiments, polished microinteractions and visual prototypes.",
    href: "/experiments",
    category: "experiment",
    status: "coming-soon",
    iconName: "Layers3",
    tags: ["Motion", "Prototype", "UI"],
    ctaLabel: "Explore",
  },
  {
    slug: "launchpad",
    title: "Creator Launchpad",
    description:
      "A future module for tracking favorites, recently played items and profile-driven suggestions.",
    href: "/profile",
    category: "experiment",
    status: "coming-soon",
    iconName: "Rocket",
    tags: ["Profile", "Data", "Roadmap"],
    ctaLabel: "See roadmap",
  },
];

export const featuredItems = catalogItems.filter((item) => item.featured);
