import type { NavItem } from "@/types/catalog";

export const siteConfig = {
  name: "FrankmanDev Playground",
  description:
    "A modern hub for browser games, practical apps and experiments built around the FrankmanDev brand.",
  headline: "Games, useful apps and experiments in one place.",
  url: "https://play.frankmandev.dev",
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/apps", label: "Apps" },
  { href: "/experiments", label: "Experiments" },
  { href: "/profile", label: "Profile" },
];
