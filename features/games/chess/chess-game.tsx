"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card as SurfaceCard } from "@/components/ui/card";
import { pickBestMove } from "@/features/games/chess/ai";
import {
  applyMove,
  BOARD_FILES,
  BOARD_RANKS,
  createInitialChessState,
  getCapturedPieces,
  getLegalMoves,
  getPieceAt,
  getSquareColor,
  isInCheck,
  PROMOTION_PIECES,
} from "@/features/games/chess/engine";
import type {
  ChessColor,
  ChessState,
  MoveRecord,
  PromotionPiece,
  Square,
} from "@/features/games/chess/types";
import { cn } from "@/lib/utils";

type PendingPromotion = {
  from: Square;
  options: PromotionPiece[];
  to: Square;
};

const CPU_MOVE_DELAY_MS = 320;

export function ChessGame() {
  const t = useTranslations();
  const [game, setGame] = useState<ChessState>(createInitialChessState);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [orientation, setOrientation] = useState<ChessColor>("white");
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [cpuEnabled, setCpuEnabled] = useState(false);
  const [humanColor, setHumanColor] = useState<ChessColor>("white");
  const [cpuThinking, setCpuThinking] = useState(false);

  const gameRef = useRef(game);
  const cpuEnabledRef = useRef(cpuEnabled);
  const humanColorRef = useRef(humanColor);
  const pendingPromotionRef = useRef(pendingPromotion);
  const isCpuThinkingRef = useRef(false);

  useEffect(() => {
    gameRef.current = game;
    cpuEnabledRef.current = cpuEnabled;
    humanColorRef.current = humanColor;
    pendingPromotionRef.current = pendingPromotion;
  }, [cpuEnabled, game, humanColor, pendingPromotion]);

  useEffect(() => {
    let cancelled = false;
    let showThinkingId: ReturnType<typeof setTimeout> | undefined;
    let moveId: ReturnType<typeof setTimeout> | undefined;

    if (!cpuEnabled || pendingPromotion) {
      return () => {
        isCpuThinkingRef.current = false;
      };
    }

    if (game.status !== "active" && game.status !== "check") {
      return () => {};
    }

    if (game.turn === humanColor) {
      return () => {};
    }

    isCpuThinkingRef.current = true;
    showThinkingId = setTimeout(() => {
      if (!cancelled) {
        setCpuThinking(true);
      }
    }, 0);

    moveId = setTimeout(() => {
      if (cancelled) {
        return;
      }
      const current = gameRef.current;
      if (
        !cpuEnabledRef.current ||
        pendingPromotionRef.current ||
        (current.status !== "active" && current.status !== "check") ||
        current.turn === humanColorRef.current
      ) {
        isCpuThinkingRef.current = false;
        setCpuThinking(false);
        return;
      }
      const move = pickBestMove(current);
      if (move) {
        setGame(applyMove(current, move));
      }
      isCpuThinkingRef.current = false;
      setCpuThinking(false);
    }, CPU_MOVE_DELAY_MS);

    return () => {
      cancelled = true;
      if (showThinkingId !== undefined) {
        clearTimeout(showThinkingId);
      }
      if (moveId !== undefined) {
        clearTimeout(moveId);
      }
      isCpuThinkingRef.current = false;
      setCpuThinking(false);
    };
  }, [cpuEnabled, humanColor, pendingPromotion, game]);

  const selectedMoves = useMemo(
    () => (selectedSquare ? getLegalMoves(game, selectedSquare) : []),
    [game, selectedSquare],
  );
  const selectedTargets = useMemo(
    () => new Set(selectedMoves.map((move) => move.to)),
    [selectedMoves],
  );
  const whiteCaptures = useMemo(() => getCapturedPieces(game, "white"), [game]);
  const blackCaptures = useMemo(() => getCapturedPieces(game, "black"), [game]);
  const checkedKingSquare = useMemo(
    () => (isInCheck(game, game.turn) ? findKingSquare(game, game.turn) : null),
    [game],
  );
  const ranks = orientation === "white" ? BOARD_RANKS : [...BOARD_RANKS].reverse();
  const files = orientation === "white" ? BOARD_FILES : [...BOARD_FILES].reverse();
  const canInteract = game.status === "active" || game.status === "check";
  const boardInteractive =
    canInteract && !pendingPromotion && !cpuThinking;
  const lastMove = game.lastMove;
  const selectionPiece = selectedSquare ? getPieceAt(game, selectedSquare) : null;

  function handleReset() {
    setGame(createInitialChessState());
    setPendingPromotion(null);
    setSelectedSquare(null);
    setCpuThinking(false);
    isCpuThinkingRef.current = false;
  }

  function handleSquareClick(square: Square) {
    if (!boardInteractive) {
      return;
    }

    const piece = getPieceAt(game, square);

    if (selectedSquare) {
      const matchingMoves = selectedMoves.filter((move) => move.to === square);

      if (matchingMoves.length > 0) {
        const promotionMoves = matchingMoves.filter((move) => move.promotion);

        if (promotionMoves.length > 0) {
          setPendingPromotion({
            from: selectedSquare,
            options: promotionMoves.map((move) => move.promotion!),
            to: square,
          });
          return;
        }

        commitMove(matchingMoves[0]);
        return;
      }

      if (piece?.color === game.turn) {
        setSelectedSquare(square);
        return;
      }

      setSelectedSquare(null);
      return;
    }

    if (piece?.color === game.turn) {
      setSelectedSquare(square);
    }
  }

  function commitMove(move: { from: Square; to: Square; promotion?: PromotionPiece }) {
    setGame((currentGame) => applyMove(currentGame, move));
    setPendingPromotion(null);
    setSelectedSquare(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <SurfaceCard className="relative space-y-5 overflow-hidden">
          <motion.div
            animate={{ opacity: [0.14, 0.24, 0.14] }}
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(245,196,0,0.22),transparent_72%)]"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
                {t.chess.tableStatus}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{t.chess.title}</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setCpuEnabled(false)}
                  type="button"
                  variant={!cpuEnabled ? "secondary" : "ghost"}
                >
                  {t.chess.twoPlayers}
                </Button>
                <Button
                  onClick={() => setCpuEnabled(true)}
                  title={t.chess.depthTooltip}
                  type="button"
                  variant={cpuEnabled ? "secondary" : "ghost"}
                >
                  {t.chess.vsCpu}
                </Button>
              </div>
              {cpuEnabled ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#F7F3EB]/55">{t.chess.humanColorLabel}</span>
                  <Button
                    onClick={() => setHumanColor("white")}
                    size="sm"
                    type="button"
                    variant={humanColor === "white" ? "secondary" : "ghost"}
                  >
                    {t.chess.playAsWhite}
                  </Button>
                  <Button
                    onClick={() => setHumanColor("black")}
                    size="sm"
                    type="button"
                    variant={humanColor === "black" ? "secondary" : "ghost"}
                  >
                    {t.chess.playAsBlack}
                  </Button>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleReset} variant="secondary">
                  {t.chess.reset}
                </Button>
                <Button
                  onClick={() =>
                    setOrientation((current) => (current === "white" ? "black" : "white"))
                  }
                  type="button"
                  variant="ghost"
                >
                  {t.chess.flip}
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ borderColor: ["rgba(245,196,0,0.18)", "rgba(245,196,0,0.34)", "rgba(245,196,0,0.18)"] }}
            className="rounded-3xl border bg-[#0B0B10]/70 p-4 text-[#F7F3EB]/80"
          >
            {getStatusMessage(t, game)}
          </motion.div>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
                {t.chess.boardTitle}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{t.chess.turn}</h3>
            </div>

            <div className="flex flex-col items-end gap-1 sm:items-end">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#F7F3EB]/75">
                {game.turn === "white" ? t.chess.whiteToMove : t.chess.blackToMove}
              </div>
              {cpuEnabled && cpuThinking ? (
                <p className="text-xs text-[#F5C400]/90">{t.chess.cpuThinking}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#09121A] p-3 shadow-2xl shadow-black/30">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div className="grid grid-rows-8 gap-1">
                {ranks.map((rank) => (
                  <div
                    className="flex items-center justify-center text-xs font-medium text-[#F7F3EB]/45"
                    key={`rank-${rank}`}
                  >
                    {rank}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="grid aspect-square grid-cols-8 gap-1">
                  {ranks.flatMap((rank) =>
                    files.map((file) => {
                      const square = `${file}${rank}` as Square;
                      const piece = getPieceAt(game, square);
                      const isSelected = selectedSquare === square;
                      const isTarget = selectedTargets.has(square);
                      const isLastMove =
                        lastMove?.from === square || lastMove?.to === square;
                      const isCheckedKing = checkedKingSquare === square;

                      return (
                        <motion.button
                          className={cn(
                            "relative aspect-square overflow-hidden rounded-xl border transition",
                            getSquareTone(square),
                            isSelected && "border-[#F5C400] ring-2 ring-[#F5C400]/55",
                            isTarget && "border-emerald-300/45",
                            isLastMove && "border-sky-300/35",
                            isCheckedKing && "border-rose-400/65 ring-2 ring-rose-400/45",
                            !boardInteractive && "cursor-not-allowed opacity-75",
                          )}
                          disabled={!boardInteractive}
                          key={square}
                          onClick={() => handleSquareClick(square)}
                          type="button"
                          whileHover={boardInteractive ? { scale: 1.015 } : undefined}
                          whileTap={boardInteractive ? { scale: 0.98 } : undefined}
                        >
                          <span className="pointer-events-none absolute left-2 top-1 text-[10px] font-medium text-black/40">
                            {file === files[0] ? rank : ""}
                          </span>
                          <span className="pointer-events-none absolute bottom-1 right-2 text-[10px] font-medium text-black/40">
                            {rank === ranks[ranks.length - 1] ? file : ""}
                          </span>

                          {isTarget && !piece ? (
                            <motion.span
                              animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.9, 1, 0.9] }}
                              className="pointer-events-none absolute inset-0 m-auto h-4 w-4 rounded-full bg-emerald-200/75"
                            />
                          ) : null}

                          {piece ? (
                            <motion.div
                              animate={{ scale: isSelected ? 1.06 : 1 }}
                              className="relative flex h-full w-full items-center justify-center p-2"
                              layout
                              transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            >
                              <Image
                                alt={`${t.chess.pieceAltPrefix} ${piece.color} ${piece.type}`}
                                className="h-full w-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.45)]"
                                height={88}
                                priority={false}
                                src={`/chess/${piece.color}-${piece.type}.svg`}
                                width={88}
                              />
                            </motion.div>
                          ) : null}
                        </motion.button>
                      );
                    }),
                  )}
                </div>

                <div className="grid grid-cols-8 gap-1 pl-1">
                  {files.map((file) => (
                    <div
                      className="text-center text-xs font-medium text-[#F7F3EB]/45"
                      key={`file-${file}`}
                    >
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <div className="space-y-6">
        <SurfaceCard className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">{t.chess.summary}</p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <StatPill
              label={t.chess.mode}
              value={
                cpuEnabled
                  ? `${t.chess.vsCpu} · ${humanColor === "white" ? t.chess.playAsWhite : t.chess.playAsBlack}`
                  : t.chess.twoPlayers
              }
            />
            <StatPill
              label={t.chess.statusLabel}
              value={getStatusLabel(t, game)}
            />
            <StatPill
              label={t.chess.selectionLabel}
              value={selectionPiece ? `${selectionPiece.color} ${selectionPiece.type}` : t.chess.noSelection}
            />
            <StatPill
              label={t.chess.lastMove}
              value={game.lastMove?.notation ?? t.chess.emptyHistory}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
            {t.chess.capturesTitle}
          </p>

          <CaptureRow
            label={t.chess.whiteCaptures}
            pieces={whiteCaptures}
          />
          <CaptureRow
            label={t.chess.blackCaptures}
            pieces={blackCaptures}
          />
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
            {t.chess.moveHistory}
          </p>

          <div className="space-y-2">
            {game.history.length === 0 ? (
              <p className="text-sm text-[#F7F3EB]/60">{t.chess.emptyHistory}</p>
            ) : (
              game.history.slice(-10).map((move, index) => (
                <div
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  key={`${move.notation}-${index}`}
                >
                  <span className="text-[#F7F3EB]/55">
                    {Math.max(game.history.length - 9 + index, 1)}
                  </span>
                  <span className="font-medium text-white">{move.notation}</span>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
            {t.chess.rulesTitle}
          </p>

          <ul className="space-y-3 text-sm leading-7 text-[#F7F3EB]/78">
            {t.chess.rules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <AnimatePresence>
        {pendingPromotion ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0F0F14] p-6 shadow-2xl shadow-black/40"
              initial={{ opacity: 0, scale: 0.94 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
                {t.chess.promotionTitle}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{t.chess.choosePromotion}</h3>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {pendingPromotion.options.map((promotion) => (
                  <button
                    className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                    key={promotion}
                    onClick={() =>
                      commitMove({
                        from: pendingPromotion.from,
                        to: pendingPromotion.to,
                        promotion,
                      })
                    }
                    type="button"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center">
                      <Image
                        alt={`${t.chess.pieceAltPrefix} ${game.turn} ${promotion}`}
                        height={64}
                        src={`/chess/${game.turn}-${promotion}.svg`}
                        width={64}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium capitalize text-white">{promotion}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CaptureRow({
  label,
  pieces,
}: {
  label: string;
  pieces: ChessState["history"][number]["captured"][];
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#F7F3EB]/55">{label}</p>
      <div className="flex min-h-14 flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        {pieces.length === 0 ? (
          <p className="text-sm text-[#F7F3EB]/45">-</p>
        ) : (
          pieces.map((piece, index) =>
            piece ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20"
                key={`${piece.color}-${piece.type}-${index}`}
              >
                <Image
                  alt={`${piece.color} ${piece.type}`}
                  height={36}
                  src={`/chess/${piece.color}-${piece.type}.svg`}
                  width={36}
                />
              </div>
            ) : null,
          )
        )}
      </div>
    </div>
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

function findKingSquare(state: ChessState, color: ChessColor) {
  for (const rank of BOARD_RANKS) {
    for (const file of BOARD_FILES) {
      const square = `${file}${rank}` as Square;
      const piece = getPieceAt(state, square);

      if (piece?.color === color && piece.type === "king") {
        return square;
      }
    }
  }

  return null;
}

function getSquareTone(square: Square) {
  return getSquareColor(square) === "light"
    ? "border-[#F2D39B]/10 bg-[#E6C48A]"
    : "border-[#2A4957]/15 bg-[#275164]";
}

function getStatusLabel(t: ReturnType<typeof useTranslations>, game: ChessState) {
  switch (game.status) {
    case "check":
      return t.chess.check;
    case "checkmate":
      return game.winner === "white" ? t.chess.whiteWinsByMate : t.chess.blackWinsByMate;
    case "stalemate":
      return t.chess.stalemate;
    case "draw-repetition":
      return t.chess.drawRepetition;
    case "draw-fifty-move":
      return t.chess.drawFifty;
    case "draw-insufficient-material":
      return t.chess.drawInsufficient;
    default:
      return t.chess.active;
  }
}

function getStatusMessage(t: ReturnType<typeof useTranslations>, game: ChessState) {
  switch (game.status) {
    case "check":
      return `${game.turn === "white" ? t.chess.white : t.chess.black} ${t.chess.check}`;
    case "checkmate":
      return game.winner === "white" ? t.chess.whiteWinsByMate : t.chess.blackWinsByMate;
    case "stalemate":
      return t.chess.stalemate;
    case "draw-repetition":
      return t.chess.drawRepetition;
    case "draw-fifty-move":
      return t.chess.drawFifty;
    case "draw-insufficient-material":
      return t.chess.drawInsufficient;
    default:
      return game.turn === "white" ? t.chess.whiteToMove : t.chess.blackToMove;
  }
}
