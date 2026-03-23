"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";

export default function ExperimentsPage() {
	const t = useTranslations();

  return (
    <div className="space-y-10">
      <SectionHeading
				description={t.experimentsPage.description}
				eyebrow={t.experimentsPage.eyebrow}
				title={t.experimentsPage.title}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{t.experimentsPage.items.map((experiment) => (
          <Card className="space-y-4" key={experiment.title}>
            <h2 className="text-xl font-semibold text-white">{experiment.title}</h2>
            <p className="text-sm leading-7 text-slate-300">
              {experiment.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
