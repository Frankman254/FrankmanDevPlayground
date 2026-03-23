import type { NavItem } from "@/types/catalog";

export const siteConfig = {
  name: "FrankmanDev Playground",
  description:
    "Un hub moderno para juegos web, aplicaciones utiles y experimentos dentro de la marca FrankmanDev.",
  headline: "Juegos, aplicaciones utiles y experimentos en un solo lugar.",
  url: "https://play.frankmandev.dev",
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/games", label: "Juegos" },
  { href: "/apps", label: "Aplicaciones" },
  { href: "/experiments", label: "Experimentos" },
  { href: "/profile", label: "Perfil" },
];
