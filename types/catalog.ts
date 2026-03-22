import type { LucideIcon } from "lucide-react";

export type CatalogCategory = "game" | "app" | "experiment";
export type ItemStatus = "live" | "coming-soon";

export type CatalogItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  category: CatalogCategory;
  status: ItemStatus;
  iconName: string;
  tags: string[];
  ctaLabel: string;
  featured?: boolean;
};

export type NavItem = {
  href: string;
  label: string;
};

export type IconMap = Record<string, LucideIcon>;
