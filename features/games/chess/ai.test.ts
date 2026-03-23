import { describe, expect, it } from "vitest";

import { evaluateMaterial, pickBestMove } from "@/features/games/chess/ai";
import {
  applyMove,
  createEmptyChessState,
  createInitialChessState,
  getLegalMoves,
  getPositionKey,
  setPieceAt,
} from "@/features/games/chess/engine";
import type { ChessState, Move, Square } from "@/features/games/chess/types";

function syncPositionCounts(state: ChessState) {
  state.positionCounts = {
    [getPositionKey(state)]: 1,
  };
}

describe("chess ai", () => {
  it("finds checkmate in one for black", () => {
    const state = createEmptyChessState();
    setPieceAt(state.board, "h1", { color: "white", type: "king" });
    setPieceAt(state.board, "g3", { color: "black", type: "king" });
    setPieceAt(state.board, "e2", { color: "black", type: "queen" });
    state.turn = "black";
    state.castlingRights.white.kingSide = false;
    state.castlingRights.white.queenSide = false;
    state.castlingRights.black.kingSide = false;
    state.castlingRights.black.queenSide = false;
    syncPositionCounts(state);

    const best = pickBestMove(state);
    expect(best).not.toBeNull();
    const after = applyMove(state, best!);
    expect(after.status).toBe("checkmate");
    expect(after.winner).toBe("black");
  });

  it("captures a hanging queen with the knight when it is clearly best", () => {
    const state = createEmptyChessState();
    setPieceAt(state.board, "g1", { color: "white", type: "king" });
    setPieceAt(state.board, "g8", { color: "black", type: "king" });
    setPieceAt(state.board, "f3", { color: "white", type: "knight" });
    setPieceAt(state.board, "e5", { color: "black", type: "queen" });
    state.turn = "white";
    syncPositionCounts(state);

    const best = pickBestMove(state);
    expect(best).toEqual({ from: "f3" as Square, to: "e5" as Square });
  });

  it("always returns a legal move from the starting position", () => {
    const state = createInitialChessState();
    const best = pickBestMove(state);
    expect(best).not.toBeNull();
    const legal = getLegalMoves(state);
    expect(legal.some((m) => moveEquals(m, best!))).toBe(true);
  });

  it("evaluateMaterial is balanced for the starting position", () => {
    const state = createInitialChessState();
    expect(evaluateMaterial(state, "white")).toBe(0);
    expect(evaluateMaterial(state, "black")).toBe(0);
  });
});

function moveEquals(a: Move, b: Move) {
  return a.from === b.from && a.to === b.to && a.promotion === b.promotion;
}
