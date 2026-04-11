"use client";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { getCatalogItems } from "@/lib/catalog";

export default function UtilitiesPage() {
  const { locale } = useLocale();
  const t = useTranslations();
  const utilities = getCatalogItems(locale).filter((item) => item.category === "utility");

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t.utilitiesPage.eyebrow}
        title={t.utilitiesPage.title}
        description={t.utilitiesPage.description}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {utilities.map((item) => (
          <ItemCard item={item} key={item.slug} />
        ))}
      </div>
    </div>
  );
}
