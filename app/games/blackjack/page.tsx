"use client";

import dynamic from "next/dynamic";

import { useTranslations } from "@/components/providers/locale-provider";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";

const BlackjackGame = dynamic(
  () =>
    import("@/features/games/blackjack/blackjack-game").then(
      (module) => module.BlackjackGame,
    ),
  {
    ssr: false,
    loading: () => <BlackjackLoadingState />,
  },
);

export default function BlackjackPage() {
	const t = useTranslations();

  return (
    <div className="space-y-10">
      <SectionHeading
				description={t.blackjackPage.description}
				eyebrow={t.blackjackPage.eyebrow}
				title={t.blackjackPage.title}
      />
      <BlackjackGame />
    </div>
  );
}

function BlackjackLoadingState() {
	const t = useTranslations();

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
					{t.blackjackPage.loadingStatus}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
					{t.blackjackPage.loadingTitle}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
					<p className="text-sm text-slate-400">{t.blackjackPage.player}</p>
					<p className="mt-2 text-lg font-medium text-white">
						{t.blackjackPage.preparingHand}
					</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
					<p className="text-sm text-slate-400">{t.blackjackPage.house}</p>
					<p className="mt-2 text-lg font-medium text-white">
						{t.blackjackPage.preparingHand}
					</p>
        </div>
      </div>
    </Card>
  );
}
