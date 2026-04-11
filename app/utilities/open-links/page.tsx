"use client";

import { OpenLinksApp } from "@/features/apps/open-links/open-links-app";
import { SectionHeading } from "@/components/section-heading";
import { useTranslations } from "@/components/providers/locale-provider";

export default function OpenLinksPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t.utilitiesPage.eyebrow}
        title={t.utilitiesPage.title}
        description={t.utilitiesPage.description}
      />
      <OpenLinksApp />
    </div>
  );
}
