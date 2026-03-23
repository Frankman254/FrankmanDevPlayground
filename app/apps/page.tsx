"use client";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { getCatalogItems } from "@/lib/catalog";

export default function AppsPage() {
	const { locale } = useLocale();
	const t = useTranslations();
	const apps = getCatalogItems(locale).filter((item) => item.category === "app");

  return (
    <div className="space-y-10">
      <SectionHeading
				description={t.appsPage.description}
				eyebrow={t.appsPage.eyebrow}
				title={t.appsPage.title}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {apps.map((item) => (
          <ItemCard item={item} key={item.slug} />
        ))}
      </div>
    </div>
  );
}
