"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Card as SurfaceCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createDeck,
  drawCard,
  formatWinnerMessage,
  getHandValue,
  resolveWinner,
  shouldHouseDraw,
} from "@/features/games/blackjack/logic";
import type { Card } from "@/features/games/blackjack/types";

type GameState = {
  deck: Card[];
  playerHand: Card[];
  houseHand: Card[];
  message: string;
  isRoundOver: boolean;
};

function dealOpeningHand(deck: Card[]) {
  let currentDeck = [...deck];
  const playerHand: Card[] = [];
  const houseHand: Card[] = [];

  for (let index = 0; index < 2; index += 1) {
    const playerDraw = drawCard(currentDeck);
    currentDeck = playerDraw.deck;
    playerHand.push(playerDraw.card);

    const houseDraw = drawCard(currentDeck);
    currentDeck = houseDraw.deck;
    houseHand.push(houseDraw.card);
  }

  return {
    deck: currentDeck,
    playerHand,
    houseHand,
  };
}

function createInitialState(): GameState {
  const deck = createDeck();
  const openingHand = dealOpeningHand(deck);

  return {
    ...openingHand,
    message: "A new round is live. Hit for more cards or stand and let the house play.",
    isRoundOver: false,
  };
}

function CardChip({ card, hidden = false }: { card?: Card; hidden?: boolean }) {
  const imageSrc = hidden ? "/cards/red_back.png" : card ? `/cards/${card.code}.png` : "";
  const imageAlt = hidden ? "Hidden playing card" : `${card?.rank ?? ""}${card?.suit ?? ""} playing card`;

  if (hidden) {
    return (
      <motion.div
        className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/90 shadow-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Image
          alt={imageAlt}
          className="h-auto w-28 md:w-32"
          height={314}
          priority={false}
          src={imageSrc}
          width={226}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg"
      initial={{ opacity: 0, y: 12, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.2 }}
    >
      {card ? (
        <Image
          alt={imageAlt}
          className="h-auto w-28 md:w-32"
          height={314}
          priority={false}
          src={imageSrc}
          width={226}
        />
      ) : null}
    </motion.div>
  );
}

export function BlackjackGame() {
  const [game, setGame] = useState<GameState>(createInitialState);

  const playerScore = useMemo(() => getHandValue(game.playerHand), [game.playerHand]);
  const houseScore = useMemo(() => getHandValue(game.houseHand), [game.houseHand]);

  function startNewGame() {
    setGame(createInitialState());
  }

  function handleHit() {
    if (game.isRoundOver) {
      return;
    }

    const { card, deck } = drawCard(game.deck);
    const nextPlayerHand = [...game.playerHand, card];
    const nextPlayerScore = getHandValue(nextPlayerHand);

    setGame((currentGame) => ({
      ...currentGame,
      deck,
      playerHand: nextPlayerHand,
      isRoundOver: nextPlayerScore > 21,
      message:
        nextPlayerScore > 21
          ? formatWinnerMessage(
              resolveWinner(nextPlayerScore, getHandValue(currentGame.houseHand)),
              nextPlayerScore,
              getHandValue(currentGame.houseHand),
            )
          : "Nice draw. You can keep pushing your luck or stand now.",
    }));
  }

  function handleStand() {
    if (game.isRoundOver) {
      return;
    }

    let nextDeck = [...game.deck];
    let nextHouseHand = [...game.houseHand];

    while (shouldHouseDraw(playerScore, getHandValue(nextHouseHand))) {
      const draw = drawCard(nextDeck);
      nextDeck = draw.deck;
      nextHouseHand = [...nextHouseHand, draw.card];
    }

    const finalHouseScore = getHandValue(nextHouseHand);
    const winner = resolveWinner(playerScore, finalHouseScore);

    setGame((currentGame) => ({
      ...currentGame,
      deck: nextDeck,
      houseHand: nextHouseHand,
      isRoundOver: true,
      message: formatWinnerMessage(winner, playerScore, finalHouseScore),
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <SurfaceCard className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
                Table status
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Blackjack Reboot
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleHit}>Hit</Button>
              <Button onClick={handleStand} variant="secondary">
                Stand
              </Button>
              <Button onClick={startNewGame} variant="ghost">
                New round
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-slate-300">
            {game.message}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-6">
          <ScoreRow label="Player" score={playerScore} />
          <div className="flex flex-wrap gap-3">
            {game.playerHand.map((card) => (
              <CardChip card={card} key={`${card.code}-${card.rank}`} />
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-6">
          <ScoreRow label="House" score={game.isRoundOver ? houseScore : getHandValue([game.houseHand[0]])} />
          <div className="flex flex-wrap gap-3">
            {game.houseHand.map((card, index) => (
              <CardChip
                card={card}
                hidden={!game.isRoundOver && index === 1}
                key={`${card.code}-${index}`}
              />
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
            Improvements over the legacy version
          </p>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            <li>Typed deck and card model instead of stringly-typed globals.</li>
            <li>Real ace handling so hands can flex between 1 and 11.</li>
            <li>House strategy stops drawing if the player already busted.</li>
            <li>No external shuffle dependency or missing image assets.</li>
          </ul>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <StatPill label="Cards left" value={String(game.deck.length)} />
          <StatPill label="Round status" value={game.isRoundOver ? "Resolved" : "In play"} />
          <StatPill label="Persistence" value="Local game state" />
          <StatPill label="Future upgrades" value="Profiles and stats" />
        </div>
      </SurfaceCard>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">{label}</p>
        <h3 className="mt-1 text-2xl font-semibold text-white">{score} pts</h3>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-medium text-white">{value}</p>
    </div>
  );
}
