import {
  applyMove,
  BOARD_FILES,
  BOARD_RANKS,
  getLegalMoves,
  getPieceAt,
  isInCheck,
} from "@/features/games/chess/engine";
import type { ChessColor, ChessState, Move, PieceType, Square } from "@/features/games/chess/types";

/** Half-moves to search from the position after the root move (e.g. 2 = opp + reply). */
export const SEARCH_PLIES = 2;

const MATE_SCORE = 1_000_000;

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 50_000,
};

function isActivePlay(state: ChessState) {
  return state.status === "active" || state.status === "check";
}

/** Prefer shorter wins / delayed losses using remaining search depth at this node. */
function mateWinScore(depth: number) {
  return MATE_SCORE - (SEARCH_PLIES - depth);
}

function mateLossScore(depth: number) {
  return -MATE_SCORE + (SEARCH_PLIES - depth);
}

/**
 * Signed material from `perspective` (positive = good for that color).
 * Tiny center bonus for pawns on d/e files ranks 4–5 (optional heuristic).
 */
export function evaluateMaterial(state: ChessState, perspective: ChessColor): number {
  let score = 0;
  for (const rank of BOARD_RANKS) {
    for (const file of BOARD_FILES) {
      const square = `${file}${rank}` as Square;
      const piece = getPieceAt(state, square);
      if (!piece) {
        continue;
      }
      let v = PIECE_VALUES[piece.type];
      if (piece.type === "pawn") {
        const f = file;
        if ((f === "d" || f === "e") && (rank === "4" || rank === "5")) {
          v += 8;
        }
      }
      score += piece.color === perspective ? v : -v;
    }
  }
  return score;
}

function scoreTerminal(state: ChessState, rootPlayer: ChessColor, depth: number): number {
  if (state.status === "checkmate" && state.winner) {
    return state.winner === rootPlayer ? mateWinScore(depth) : mateLossScore(depth);
  }
  if (
    state.status === "stalemate" ||
    state.status === "draw-repetition" ||
    state.status === "draw-fifty-move" ||
    state.status === "draw-insufficient-material"
  ) {
    return 0;
  }

  const legal = getLegalMoves(state);
  if (legal.length === 0) {
    if (isInCheck(state, state.turn)) {
      const loser = state.turn;
      return loser === rootPlayer ? mateLossScore(depth) : mateWinScore(depth);
    }
    return 0;
  }

  return evaluateMaterial(state, rootPlayer);
}

function minimax(
  state: ChessState,
  depth: number,
  alpha: number,
  beta: number,
  rootPlayer: ChessColor,
): number {
  if (state.status === "checkmate" && state.winner) {
    return state.winner === rootPlayer ? mateWinScore(depth) : mateLossScore(depth);
  }
  if (
    state.status === "stalemate" ||
    state.status === "draw-repetition" ||
    state.status === "draw-fifty-move" ||
    state.status === "draw-insufficient-material"
  ) {
    return 0;
  }

  const legal = getLegalMoves(state);
  if (legal.length === 0) {
    return scoreTerminal(state, rootPlayer, depth);
  }

  if (depth === 0) {
    return evaluateMaterial(state, rootPlayer);
  }

  const maximizing = state.turn === rootPlayer;

  if (maximizing) {
    let best = -Infinity;
    for (const move of legal) {
      const next = applyMove(state, move);
      const score = minimax(next, depth - 1, alpha, beta, rootPlayer);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break;
      }
    }
    return best;
  }

  let best = Infinity;
  for (const move of legal) {
    const next = applyMove(state, move);
    const score = minimax(next, depth - 1, alpha, beta, rootPlayer);
    best = Math.min(best, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) {
      break;
    }
  }
  return best;
}

/**
 * Best reply for `state.turn` using fixed-depth alpha–beta and material eval.
 * Returns null if the game is not playable or there are no legal moves.
 */
export function pickBestMove(state: ChessState): Move | null {
  if (!isActivePlay(state)) {
    return null;
  }
  const legal = getLegalMoves(state);
  if (legal.length === 0) {
    return null;
  }

  const rootPlayer = state.turn;
  let bestMove = legal[0];
  let bestScore = -Infinity;

  for (const move of legal) {
    const next = applyMove(state, move);
    const score = minimax(next, SEARCH_PLIES, -Infinity, Infinity, rootPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
