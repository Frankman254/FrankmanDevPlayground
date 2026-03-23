"use client";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { getCatalogItems } from "@/lib/catalog";

export default function GamesPage() {
	const { locale } = useLocale();
	const t = useTranslations();
	const games = getCatalogItems(locale).filter((item) => item.category === "game");

  return (
    <div className="space-y-10">
      <SectionHeading
				description={t.gamesPage.description}
				eyebrow={t.gamesPage.eyebrow}
				title={t.gamesPage.title}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {games.map((item) => (
          <ItemCard item={item} key={item.slug} />
        ))}
      </div>
    </div>
  );
}
