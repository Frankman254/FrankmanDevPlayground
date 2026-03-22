import Link from "next/link";

import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { catalogItems, featuredItems } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge>FrankmanDev Playground</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
              A single home for games, useful apps and experiments.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              This repo evolves the original blackjack demo into a full product
              platform that can grow into profiles, favorites, stats and future
              synced experiences.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/games/blackjack">
              <Button size="lg">Play Blackjack</Button>
            </Link>
            <Link href="/apps/todos">
              <Button size="lg" variant="secondary">
                Open Todos
              </Button>
            </Link>
          </div>
        </div>

        <Card className="grid gap-4 md:grid-cols-2">
          <StatBlock label="Live today" value="2 modules" />
          <StatBlock label="Product pillars" value="Games, Apps, Experiments" />
          <StatBlock label="Data layer" value="Supabase-ready" />
          <StatBlock label="UX strategy" value="Guest-first, account-enhanced" />
        </Card>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Featured"
          title="Built to validate the platform fast."
          description="The first release ships with one polished game and one useful app so the playground can prove both entertainment and productivity use cases."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredItems.map((item) => (
            <ItemCard item={item} key={item.slug} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Catalog"
          title="A roadmap that stays product-focused."
          description="Every module is grouped by what it does for users, not by technical layer, which keeps the platform easy to scale and easy to browse."
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
