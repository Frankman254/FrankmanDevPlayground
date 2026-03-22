"use client";

import dynamic from "next/dynamic";

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
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Game MVP"
        title="Blackjack Reboot"
        description="The legacy vanilla JavaScript demo is now a typed feature module with stronger score logic, a cleaner UX and an upgrade path for future stats."
      />
      <BlackjackGame />
    </div>
  );
}

function BlackjackLoadingState() {
  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
          Table status
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Shuffling the deck...
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Player</p>
          <p className="mt-2 text-lg font-medium text-white">Preparing hand</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">House</p>
          <p className="mt-2 text-lg font-medium text-white">Preparing hand</p>
        </div>
      </div>
    </Card>
  );
}
