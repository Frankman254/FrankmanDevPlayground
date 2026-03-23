"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { Card as SurfaceCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  canOfferInsurance,
  canSplitHand,
  createShoe,
  drawCard,
  getHandValue,
  getHandValueDetails,
  isDealerPeekCard,
  isNaturalBlackjack,
  resolveHandOutcome,
  shouldDealerDraw,
} from "@/features/games/blackjack/logic";
import type { Card, HandOutcome } from "@/features/games/blackjack/types";
import { cn } from "@/lib/utils";

type GameState = {
  shoe: Card[];
  dealerHand: Card[];
  playerHands: PlayerHandState[];
  activeHandIndex: number;
  bankroll: number;
  bankrollBeforeRound: number;
  bet: number;
  insuranceBet: number;
  dealerHoleRevealed: boolean;
  lastRoundDelta: number;
  phase: TablePhase;
  round: number;
};

type TablePhase = "playerTurn" | "insurance" | "dealerTurn" | "roundOver";

type PlayerHandState = {
  id: number;
  cards: Card[];
  wager: number;
  isDoubled: boolean;
  isFinished: boolean;
  isSplitHand: boolean;
  isSplitAces: boolean;
  outcome?: HandOutcome;
  payout: number;
};

const BET_OPTIONS = [25, 50, 100, 200];
const INITIAL_BANKROLL = 1_000;
const DEFAULT_BET = 50;
const SHOE_DECKS = 6;
const CUT_CARD = 52;
const DEAL_DELAY_MS = 420;
let nextHandId = 1;

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function ensureShoe(shoe: Card[]) {
  return shoe.length >= CUT_CARD ? shoe : createShoe(SHOE_DECKS);
}

function formatChips(value: number) {
  return `${value.toLocaleString()} chips`;
}

function getBestAvailableBet(bankroll: number, preferredBet: number) {
  const affordableBets = BET_OPTIONS.filter((bet) => bet <= bankroll);

  if (affordableBets.includes(preferredBet)) {
    return preferredBet;
  }

  return affordableBets.at(-1) ?? 0;
}

function getNextPlayableHandIndex(hands: PlayerHandState[], startIndex = 0) {
  for (let index = startIndex; index < hands.length; index += 1) {
    if (!hands[index].isFinished) {
      return index;
    }
  }

  return -1;
}

function getVisibleDealerScore(dealerHand: Card[], dealerHoleRevealed: boolean) {
  if (dealerHoleRevealed) {
    return getHandValue(dealerHand);
  }

  return dealerHand[0] ? getHandValue([dealerHand[0]]) : 0;
}

function getOutcomeTone(outcome?: HandOutcome) {
  switch (outcome) {
    case "blackjack":
      return "border-[#F5C400]/45 bg-[#F5C400]/12 text-[#FFE78A]";
    case "win":
      return "border-emerald-400/35 bg-emerald-400/10 text-emerald-200";
    case "lose":
      return "border-rose-400/35 bg-rose-400/10 text-rose-200";
    case "push":
      return "border-sky-400/35 bg-sky-400/10 text-sky-200";
    default:
      return "border-white/10 bg-white/5 text-[#F7F3EB]/78";
  }
}

function getCardLabel(card?: Card) {
  return card ? `${card.rank}${card.suit}` : "";
}

export function BlackjackGame() {
  const t = useTranslations();

  function createInitialState() {
    return createRoundState({
      bankroll: INITIAL_BANKROLL,
      bet: DEFAULT_BET,
      round: 0,
      shoe: createShoe(SHOE_DECKS),
    });
  }

  function createHand(
    cards: Card[],
    wager: number,
    overrides: Partial<PlayerHandState> = {},
  ): PlayerHandState {
    const { total } = getHandValueDetails(cards);

    return {
      id: nextHandId++,
      cards,
      wager,
      isDoubled: false,
      isFinished: total >= 21,
      isSplitHand: false,
      isSplitAces: false,
      payout: 0,
      ...overrides,
    };
  }

  function createRoundState({
    bankroll,
    bet,
    round,
    shoe,
  }: {
    bankroll: number;
    bet: number;
    round: number;
    shoe: Card[];
  }): GameState {
    const adjustedBet = getBestAvailableBet(bankroll, bet);
    const readyShoe = ensureShoe(shoe);

    if (adjustedBet === 0) {
      return {
        shoe: readyShoe,
        dealerHand: [],
        playerHands: [],
        activeHandIndex: 0,
        bankroll,
        bankrollBeforeRound: bankroll,
        bet,
        insuranceBet: 0,
        dealerHoleRevealed: true,
        lastRoundDelta: 0,
        phase: "roundOver",
        round,
      };
    }

    let nextShoe = [...readyShoe];
    const firstPlayerDraw = drawCard(nextShoe);
    nextShoe = firstPlayerDraw.deck;
    const firstDealerDraw = drawCard(nextShoe);
    nextShoe = firstDealerDraw.deck;
    const secondPlayerDraw = drawCard(nextShoe);
    nextShoe = secondPlayerDraw.deck;
    const secondDealerDraw = drawCard(nextShoe);
    nextShoe = secondDealerDraw.deck;

    const playerHand = createHand(
      [firstPlayerDraw.card, secondPlayerDraw.card],
      adjustedBet,
      { isFinished: false },
    );
    const nextGame: GameState = {
      shoe: nextShoe,
      dealerHand: [firstDealerDraw.card, secondDealerDraw.card],
      playerHands: [playerHand],
      activeHandIndex: 0,
      bankroll: bankroll - adjustedBet,
      bankrollBeforeRound: bankroll,
      bet: adjustedBet,
      insuranceBet: 0,
      dealerHoleRevealed: false,
      lastRoundDelta: 0,
      phase: "playerTurn",
      round: round + 1,
    };

    const dealerUpCard = nextGame.dealerHand[0];
    const dealerHasBlackjack = isNaturalBlackjack(nextGame.dealerHand);
    const playerHasBlackjack = isNaturalBlackjack(playerHand.cards);

    if (canOfferInsurance(dealerUpCard)) {
      return {
        ...nextGame,
        phase: "insurance",
      };
    }

    if (isDealerPeekCard(dealerUpCard) && dealerHasBlackjack) {
      return settleRound({
        ...nextGame,
        dealerHoleRevealed: true,
        phase: "roundOver",
      });
    }

    if (playerHasBlackjack) {
      return settleRound({
        ...nextGame,
        dealerHoleRevealed: true,
        phase: "roundOver",
      });
    }

    return nextGame;
  }

  function settleRound(roundState: GameState) {
    const dealerHasBlackjack = isNaturalBlackjack(roundState.dealerHand);
    let bankroll = roundState.bankroll;

    const settledHands = roundState.playerHands.map((hand) => {
      const outcome = resolveHandOutcome(
        hand.cards,
        roundState.dealerHand,
        !hand.isSplitHand && isNaturalBlackjack(hand.cards),
      );

      let payout = 0;

      if (outcome === "blackjack") {
        payout = hand.wager * 2.5;
      } else if (outcome === "win") {
        payout = hand.wager * 2;
      } else if (outcome === "push") {
        payout = hand.wager;
      }

      bankroll += payout;

      return {
        ...hand,
        isFinished: true,
        outcome,
        payout,
      };
    });

    if (dealerHasBlackjack && roundState.insuranceBet > 0) {
      bankroll += roundState.insuranceBet * 3;
    }

    return {
      ...roundState,
      bankroll,
      dealerHoleRevealed: true,
      phase: "roundOver" as const,
      playerHands: settledHands,
      lastRoundDelta: bankroll - roundState.bankrollBeforeRound,
    };
  }

  const [game, setGame] = useState<GameState>(() => createInitialState());

  const currentHand = game.playerHands[game.activeHandIndex];
  const dealerScore = useMemo(
    () => getVisibleDealerScore(game.dealerHand, game.dealerHoleRevealed),
    [game.dealerHand, game.dealerHoleRevealed],
  );
  const canAct = game.phase === "playerTurn" && Boolean(currentHand) && !currentHand.isFinished;
  const canHit =
    canAct && !currentHand.isSplitAces && getHandValue(currentHand.cards) < 21;
  const canStand = canAct;
  const canDouble =
    canAct && currentHand.cards.length === 2 && game.bankroll >= currentHand.wager;
  const canSplit =
    canAct &&
    currentHand.cards.length === 2 &&
    canSplitHand(currentHand.cards) &&
    game.playerHands.length < 4 &&
    game.bankroll >= currentHand.wager;
  const canTakeInsurance =
    game.phase === "insurance" && game.bankroll >= Math.floor(game.bet / 2);
  const nextRoundBet = getBestAvailableBet(game.bankroll, game.bet);
  const canStartRound = game.phase === "roundOver" && nextRoundBet > 0;
  const tableMessage = useMemo(() => getTableMessage(t, game), [t, game]);

  async function playDealerTurn(roundState: GameState) {
    let workingState = {
      ...roundState,
      dealerHoleRevealed: true,
      phase: "dealerTurn" as const,
    };

    setGame(workingState);
    await wait(DEAL_DELAY_MS);

    const allHandsBusted = workingState.playerHands.every(
      (hand) => getHandValue(hand.cards) > 21,
    );

    if (!allHandsBusted) {
      let nextShoe = [...workingState.shoe];
      let nextDealerHand = [...workingState.dealerHand];

      while (shouldDealerDraw(nextDealerHand, "S17")) {
        const draw = drawCard(nextShoe);
        nextShoe = draw.deck;
        nextDealerHand = [...nextDealerHand, draw.card];
        workingState = {
          ...workingState,
          shoe: nextShoe,
          dealerHand: nextDealerHand,
        };
        setGame(workingState);
        await wait(DEAL_DELAY_MS);
      }
    }

    setGame(settleRound(workingState));
  }

  function moveToNextHandOrDealer(nextGame: GameState, startIndex: number) {
    const nextHandIndex = getNextPlayableHandIndex(nextGame.playerHands, startIndex);

    if (nextHandIndex === -1) {
      void playDealerTurn(nextGame);
      return;
    }

    setGame({
      ...nextGame,
      activeHandIndex: nextHandIndex,
    });
  }

  function handleNewRound() {
    if (!canStartRound) {
      return;
    }

    setGame(
      createRoundState({
        bankroll: game.bankroll,
        bet: nextRoundBet,
        round: game.round,
        shoe: game.shoe,
      }),
    );
  }

  function handleRebuy() {
    setGame(createInitialState());
  }

  function handleInsurance(takeInsurance: boolean) {
    if (game.phase !== "insurance") {
      return;
    }

    const insuranceBet = takeInsurance ? Math.floor(game.bet / 2) : 0;
    const bankroll = game.bankroll - insuranceBet;
    const nextGame = {
      ...game,
      bankroll,
      insuranceBet,
      dealerHoleRevealed: true,
    };
    const dealerHasBlackjack = isNaturalBlackjack(game.dealerHand);
    const playerHasBlackjack = isNaturalBlackjack(game.playerHands[0]?.cards ?? []);

    if (dealerHasBlackjack || playerHasBlackjack) {
      setGame(
        settleRound({
          ...nextGame,
          phase: "roundOver",
        }),
      );
      return;
    }

    setGame({
      ...nextGame,
      phase: "playerTurn",
      dealerHoleRevealed: false,
    });
  }

  function handleHit() {
    if (!canHit || !currentHand) {
      return;
    }

    const draw = drawCard(game.shoe);
    const nextHand = {
      ...currentHand,
      cards: [...currentHand.cards, draw.card],
    };
    const total = getHandValue(nextHand.cards);
    nextHand.isFinished = total >= 21;

    const nextHands = game.playerHands.map((hand, index) =>
      index === game.activeHandIndex ? nextHand : hand,
    );
    const nextGame = {
      ...game,
      shoe: draw.deck,
      playerHands: nextHands,
    };

    if (!nextHand.isFinished) {
      setGame(nextGame);
      return;
    }

    moveToNextHandOrDealer(nextGame, game.activeHandIndex + 1);
  }

  function handleStand() {
    if (!canStand || !currentHand) {
      return;
    }

    const nextHands = game.playerHands.map((hand, index) =>
      index === game.activeHandIndex ? { ...hand, isFinished: true } : hand,
    );
    const nextGame = {
      ...game,
      playerHands: nextHands,
    };

    moveToNextHandOrDealer(nextGame, game.activeHandIndex + 1);
  }

  function handleDouble() {
    if (!canDouble || !currentHand) {
      return;
    }

    const draw = drawCard(game.shoe);
    const doubledHand = {
      ...currentHand,
      cards: [...currentHand.cards, draw.card],
      wager: currentHand.wager * 2,
      isDoubled: true,
      isFinished: true,
    };
    const nextHands = game.playerHands.map((hand, index) =>
      index === game.activeHandIndex ? doubledHand : hand,
    );
    const nextGame = {
      ...game,
      shoe: draw.deck,
      bankroll: game.bankroll - currentHand.wager,
      playerHands: nextHands,
    };

    moveToNextHandOrDealer(nextGame, game.activeHandIndex + 1);
  }

  function handleSplit() {
    if (!canSplit || !currentHand) {
      return;
    }

    let nextShoe = [...game.shoe];
    const firstDraw = drawCard(nextShoe);
    nextShoe = firstDraw.deck;
    const secondDraw = drawCard(nextShoe);
    nextShoe = secondDraw.deck;
    const splittingAces = currentHand.cards.every((card) => card.rank === "A");

    const firstHand = createHand([currentHand.cards[0], firstDraw.card], currentHand.wager, {
      isSplitHand: true,
      isSplitAces: splittingAces,
    });
    const secondHand = createHand([currentHand.cards[1], secondDraw.card], currentHand.wager, {
      isSplitHand: true,
      isSplitAces: splittingAces,
    });

    if (splittingAces) {
      firstHand.isFinished = true;
      secondHand.isFinished = true;
    }

    const nextHands = [...game.playerHands];
    nextHands.splice(game.activeHandIndex, 1, firstHand, secondHand);
    const nextGame = {
      ...game,
      shoe: nextShoe,
      bankroll: game.bankroll - currentHand.wager,
      playerHands: nextHands,
      activeHandIndex: game.activeHandIndex,
    };

    if (splittingAces) {
      void playDealerTurn(nextGame);
      return;
    }

    const nextPlayableIndex = getNextPlayableHandIndex(nextHands, game.activeHandIndex);

    if (nextPlayableIndex === -1) {
      void playDealerTurn(nextGame);
      return;
    }

    setGame({
      ...nextGame,
      activeHandIndex: nextPlayableIndex,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <SurfaceCard className="relative space-y-5 overflow-hidden">
          <motion.div
            animate={{ opacity: [0.18, 0.3, 0.18] }}
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(245,196,0,0.25),transparent_70%)]"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
                {t.blackjack.tableStatus}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {t.blackjack.title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {BET_OPTIONS.map((bet) => (
                <motion.button
                  animate={{ y: game.bet === bet ? -2 : 0 }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    game.bet === bet
                      ? "border-[#F5C400]/50 bg-[#F5C400]/14 text-[#FFE78A]"
                      : "border-white/10 bg-white/5 text-[#F7F3EB]/70 hover:bg-white/10",
                  )}
                  disabled={game.phase !== "roundOver" || bet > game.bankroll}
                  key={bet}
                  onClick={() => setGame((currentGame) => ({ ...currentGame, bet }))}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                >
                  {bet}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <AnimatePresence mode="wait">
              {game.phase === "insurance" ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3"
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key="insurance-actions"
                >
                  <Button disabled={!canTakeInsurance} onClick={() => handleInsurance(true)}>
                    {t.blackjack.insurance}
                  </Button>
                  <Button onClick={() => handleInsurance(false)} variant="secondary">
                    {t.blackjack.declineInsurance}
                  </Button>
                </motion.div>
              ) : game.phase === "playerTurn" ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3"
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key="player-actions"
                >
                  <Button disabled={!canHit} onClick={handleHit}>
                    {t.blackjack.hit}
                  </Button>
                  <Button disabled={!canStand} onClick={handleStand} variant="secondary">
                    {t.blackjack.stand}
                  </Button>
                  <Button disabled={!canDouble} onClick={handleDouble} variant="secondary">
                    {t.blackjack.double}
                  </Button>
                  <Button disabled={!canSplit} onClick={handleSplit} variant="secondary">
                    {t.blackjack.split}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3"
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key="round-actions"
                >
                  <Button disabled={!canStartRound} onClick={handleNewRound}>
                    {t.blackjack.newRound}
                  </Button>
                  <Button onClick={handleRebuy} variant="ghost">
                    {t.blackjack.rebuy}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            animate={{ borderColor: ["rgba(245,196,0,0.18)", "rgba(245,196,0,0.38)", "rgba(245,196,0,0.18)"] }}
            className="rounded-3xl border bg-[#0B0B10]/70 p-4 text-[#F7F3EB]/80"
          >
            {tableMessage}
          </motion.div>
        </SurfaceCard>

        <HandPanel
          cards={game.dealerHand}
          dealerHoleRevealed={game.dealerHoleRevealed}
          detailLabel={game.dealerHoleRevealed ? t.blackjack.revealedHole : t.blackjack.hiddenHole}
          label={t.blackjack.house}
          score={dealerScore}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {game.playerHands.map((hand, index) => (
            <HandPanel
              cards={hand.cards}
              dealOffset={game.dealerHand.length}
              detailLabel={getHandDetailLabel(t, hand, index, game.activeHandIndex, game.phase)}
              highlight={game.phase === "playerTurn" && index === game.activeHandIndex}
              key={hand.id}
              label={
                game.playerHands.length === 1
                  ? t.blackjack.player
                  : `${t.blackjack.hand} ${index + 1}`
              }
              outcome={hand.outcome}
              score={getHandValue(hand.cards)}
              wager={hand.wager}
            />
          ))}
        </div>
      </div>

      <SurfaceCard className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <StatPill label={t.blackjack.bankroll} value={formatChips(game.bankroll)} />
          <StatPill label={t.blackjack.nextBet} value={formatChips(game.bet)} />
          <StatPill label={t.blackjack.insuranceBet} value={formatChips(game.insuranceBet)} />
          <StatPill label={t.blackjack.shoeCards} value={String(game.shoe.length)} />
          <StatPill
            label={t.blackjack.activeHand}
            value={
              game.playerHands.length === 0
                ? "-"
                : `${Math.min(game.activeHandIndex + 1, game.playerHands.length)}/${game.playerHands.length}`
            }
          />
          <StatPill
            label={t.blackjack.roundStatus}
            value={getPhaseLabel(t, game.phase)}
          />
          <StatPill label={t.blackjack.dealerRule} value={t.blackjack.dealerRuleValue} />
          <StatPill label={t.blackjack.blackjackPayout} value={t.blackjack.blackjackPayoutValue} />
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
            {t.blackjack.rulesTitle}
          </p>
          <ul className="space-y-3 text-sm leading-7 text-[#F7F3EB]/78">
            {t.blackjack.rules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </SurfaceCard>
    </div>
  );
}

function getTableMessage(
  t: ReturnType<typeof useTranslations>,
  game: GameState,
) {
  if (game.phase === "insurance") {
    return t.blackjack.insurancePrompt;
  }

  if (game.phase === "dealerTurn") {
    return t.blackjack.dealerTurn;
  }

  if (game.phase === "playerTurn") {
    if (game.playerHands.length > 1) {
      return `${t.blackjack.playingHand} ${game.activeHandIndex + 1}/${game.playerHands.length}.`;
    }

    return `${t.blackjack.roundStart} ${t.blackjack.dealerShows} ${getCardLabel(
      game.dealerHand[0],
    )}.`;
  }

  const handSummaries = game.playerHands.map((hand, index) => {
    const label =
      game.playerHands.length === 1 ? t.blackjack.player : `${t.blackjack.hand} ${index + 1}`;

    if (hand.outcome === "blackjack") {
      return `${label}: ${t.blackjack.blackjackOutcome}`;
    }

    if (hand.outcome === "win") {
      return `${label}: ${t.blackjack.winOutcome}`;
    }

    if (hand.outcome === "lose") {
      return `${label}: ${t.blackjack.loseOutcome}`;
    }

    return `${label}: ${t.blackjack.pushOutcome}`;
  });

  const netRound =
    game.lastRoundDelta >= 0 ? `+${game.lastRoundDelta}` : `${game.lastRoundDelta}`;

  return `${handSummaries.join(" ")} ${t.blackjack.dealerTotal} ${dealerFinalLabel(
    game,
  )}. ${t.blackjack.netRound} ${netRound}.`;
}

function dealerFinalLabel(game: GameState) {
  return game.dealerHand.length === 0 ? "0" : String(getHandValue(game.dealerHand));
}

function getPhaseLabel(t: ReturnType<typeof useTranslations>, phase: TablePhase) {
  switch (phase) {
    case "insurance":
      return t.blackjack.roundInsurance;
    case "dealerTurn":
      return t.blackjack.roundDealer;
    case "roundOver":
      return t.blackjack.roundResolved;
    default:
      return t.blackjack.roundInPlay;
  }
}

function getHandDetailLabel(
  t: ReturnType<typeof useTranslations>,
  hand: PlayerHandState,
  index: number,
  activeHandIndex: number,
  phase: TablePhase,
) {
  const details = [formatChips(hand.wager)];

  if (hand.isDoubled) {
    details.push(t.blackjack.doubled);
  }

  if (hand.isSplitAces) {
    details.push(t.blackjack.splitAces);
  } else if (hand.isSplitHand) {
    details.push(t.blackjack.splitHand);
  }

  if (phase === "playerTurn" && index === activeHandIndex) {
    details.push(t.blackjack.currentHand);
  }

  return details.join(" • ");
}

function HandPanel({
  cards,
  dealOffset = 0,
  dealerHoleRevealed = true,
  detailLabel,
  highlight = false,
  label,
  outcome,
  score,
  wager,
}: {
  cards: Card[];
  dealOffset?: number;
  dealerHoleRevealed?: boolean;
  detailLabel: string;
  highlight?: boolean;
  label: string;
  outcome?: HandOutcome;
  score: number;
  wager?: number;
}) {
  const t = useTranslations();

  return (
    <motion.div
      animate={
        highlight
          ? {
              boxShadow: [
                "0 0 0 rgba(245,196,0,0)",
                "0 0 32px rgba(245,196,0,0.18)",
                "0 0 0 rgba(245,196,0,0)",
              ],
            }
          : undefined
      }
      className={cn(
        "rounded-[28px] border p-6 transition",
        highlight
          ? "border-[#F5C400]/35 bg-[linear-gradient(180deg,rgba(245,196,0,0.08),rgba(15,15,20,0.92))]"
          : "border-white/10 bg-[#0F0F14]/72",
      )}
      layout
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">{label}</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {score} {t.blackjack.scoreLabel}
          </h3>
          <p className="mt-2 text-sm text-[#F7F3EB]/65">{detailLabel}</p>
        </div>

        {wager ? (
          <div
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium",
              getOutcomeTone(outcome),
            )}
          >
            {formatChips(wager)}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {cards.map((card, index) => (
          <CardChip
            card={card}
            dealIndex={dealOffset + index}
            hidden={!dealerHoleRevealed && index === 1}
            key={`${card.code}-${index}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-[#F7F3EB]/55">{label}</p>
      <p className="mt-2 text-lg font-medium text-white">{value}</p>
    </div>
  );
}

function CardChip({
  card,
  dealIndex,
  hidden = false,
}: {
  card: Card;
  dealIndex: number;
  hidden?: boolean;
}) {
  const t = useTranslations();
  const frontSrc = `/cards/${card.code}.png`;
  const backSrc = "/cards/red_back.png";

  return (
    <motion.div
      className="relative h-[156px] w-[112px] md:h-[178px] md:w-[128px]"
      initial={{ opacity: 0, scale: 0.84, x: 72, y: -48, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
      layout
      transition={{
        delay: Math.min(dealIndex * 0.06, 0.36),
        duration: 0.28,
        type: "spring",
        stiffness: 320,
        damping: 24,
      }}
    >
      <motion.div
        animate={{ rotateY: hidden ? 0 : 180 }}
        className="relative h-full w-full"
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        transition={{ duration: 0.45 }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-[#F5C400]/20 bg-[#0F0F14]/90 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            alt={t.blackjack.hiddenCardAlt}
            className="h-full w-full object-cover"
            height={314}
            priority={false}
            src={backSrc}
            width={226}
          />
        </div>

        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Image
            alt={`${t.blackjack.cardAltPrefix} ${card.rank}${card.suit}`}
            className="h-full w-full object-cover"
            height={314}
            priority={false}
            src={frontSrc}
            width={226}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
