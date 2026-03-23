"use client";

import Link from "next/link";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCatalogItems, getFeaturedItems } from "@/lib/catalog";

export default function HomePage() {
	const { locale } = useLocale();
	const t = useTranslations();
	const featuredItems = getFeaturedItems(locale);
	const catalogItems = getCatalogItems(locale);

  return (
    <div className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge>FrankmanDev Playground</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
							{t.home.heading}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
							{t.home.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/games/blackjack">
							<Button size="lg">{t.home.playBlackjack}</Button>
            </Link>
            <Link href="/apps/todos">
							<Button size="lg" variant="secondary">
								{t.home.openTodos}
							</Button>
            </Link>
          </div>
        </div>

        <Card className="grid gap-4 md:grid-cols-2">
					<StatBlock
						label={t.home.stats.liveToday}
						value={t.home.stats.liveTodayValue}
					/>
					<StatBlock
						label={t.home.stats.pillars}
						value={t.home.stats.pillarsValue}
					/>
					<StatBlock
						label={t.home.stats.dataLayer}
						value={t.home.stats.dataLayerValue}
					/>
					<StatBlock label={t.home.stats.ux} value={t.home.stats.uxValue} />
        </Card>
      </section>

      <section className="space-y-8">
        <SectionHeading
					description={t.home.featured.description}
					eyebrow={t.home.featured.eyebrow}
					title={t.home.featured.title}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredItems.map((item) => (
            <ItemCard item={item} key={item.slug} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
					description={t.home.catalog.description}
					eyebrow={t.home.catalog.eyebrow}
					title={t.home.catalog.title}
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {catalogItems.map((item) => (
            <ItemCard item={item} key={item.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-medium text-white">{value}</p>
    </div>
  );
}
