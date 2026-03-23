"use client";

import dynamic from "next/dynamic";

import { useTranslations } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";

const ChessGame = dynamic(
  () => import("@/features/games/chess/chess-game").then((module) => module.ChessGame),
  {
    ssr: false,
    loading: () => <ChessLoadingState />,
  },
);

export default function ChessPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <SectionHeading
        description={t.chessPage.description}
        eyebrow={t.chessPage.eyebrow}
        title={t.chessPage.title}
      />
      <ChessGame />
    </div>
  );
}

function ChessLoadingState() {
  const t = useTranslations();

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
          {t.chessPage.loadingStatus}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{t.chessPage.loadingTitle}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">{t.chessPage.white}</p>
          <p className="mt-2 text-lg font-medium text-white">{t.chessPage.preparingBoard}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">{t.chessPage.black}</p>
          <p className="mt-2 text-lg font-medium text-white">{t.chessPage.preparingBoard}</p>
        </div>
      </div>
    </Card>
  );
}
