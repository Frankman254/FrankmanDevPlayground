import { describe, expect, it } from "vitest";

import {
  applyMove,
  createEmptyChessState,
  createInitialChessState,
  getGameStatus,
  getPositionKey,
  getLegalMoves,
  getPieceAt,
  setPieceAt,
} from "@/features/games/chess/engine";
import type { ChessState, Move, Square } from "@/features/games/chess/types";

function playMoves(state: ChessState, moves: Move[]) {
  return moves.reduce((currentState, move) => applyMove(currentState, move), state);
}

function createKingsOnlyState() {
  const state = createEmptyChessState();
  setPieceAt(state.board, "e1", { color: "white", type: "king" });
  setPieceAt(state.board, "e8", { color: "black", type: "king" });
  syncPositionCounts(state);
  return state;
}

function syncPositionCounts(state: ChessState) {
  state.positionCounts = {
    [getPositionKey(state)]: 1,
  };
}

describe("chess engine", () => {
  it("starts with 20 legal moves for white", () => {
    const state = createInitialChessState();

    expect(getLegalMoves(state)).toHaveLength(20);
  });

  it("detects fool's mate as checkmate", () => {
    const finalState = playMoves(createInitialChessState(), [
      { from: "f2", to: "f3" },
      { from: "e7", to: "e5" },
      { from: "g2", to: "g4" },
      { from: "d8", to: "h4" },
    ]);

    expect(finalState.status).toBe("checkmate");
    expect(finalState.winner).toBe("black");
  });

  it("allows castling when the path is clear and safe", () => {
    const state = createKingsOnlyState();
    setPieceAt(state.board, "a1", { color: "white", type: "rook" });
    setPieceAt(state.board, "h1", { color: "white", type: "rook" });
    state.castlingRights.white.kingSide = true;
    state.castlingRights.white.queenSide = true;

    const moves = getLegalMoves(state, "e1");

    expect(moves).toEqual(
      expect.arrayContaining([
        { from: "e1", to: "g1" },
        { from: "e1", to: "c1" },
      ]),
    );
  });

  it("blocks castling through an attacked square", () => {
    const state = createKingsOnlyState();
    setPieceAt(state.board, "h1", { color: "white", type: "rook" });
    setPieceAt(state.board, "f8", { color: "black", type: "rook" });
    state.castlingRights.white.kingSide = true;

    const moves = getLegalMoves(state, "e1");

    expect(moves).not.toEqual(expect.arrayContaining([{ from: "e1", to: "g1" }]));
  });

  it("supports en passant capture", () => {
    const finalState = playMoves(createInitialChessState(), [
      { from: "e2", to: "e4" },
      { from: "a7", to: "a6" },
      { from: "e4", to: "e5" },
      { from: "d7", to: "d5" },
      { from: "e5", to: "d6" },
    ]);

    expect(getPieceAt(finalState, "d6")).toMatchObject({ color: "white", type: "pawn" });
    expect(getPieceAt(finalState, "d5")).toBeNull();
  });

  it("generates all promotion choices and promotes correctly", () => {
    const state = createKingsOnlyState();
    setPieceAt(state.board, "a7", { color: "white", type: "pawn" });
    state.positionCounts = {};

    const moves = getLegalMoves(state, "a7");
    const promotionMoves = moves.filter((move) => move.to === ("a8" as Square));

    expect(promotionMoves).toHaveLength(4);

    const promotedState = applyMove(state, {
      from: "a7",
      to: "a8",
      promotion: "queen",
    });

    expect(getPieceAt(promotedState, "a8")).toMatchObject({
      color: "white",
      type: "queen",
    });
  });

  it("detects threefold repetition", () => {
    const state = createKingsOnlyState();
    setPieceAt(state.board, "a1", { color: "white", type: "rook" });
    setPieceAt(state.board, "h8", { color: "black", type: "rook" });
    syncPositionCounts(state);

    const finalState = playMoves(state, [
      { from: "a1", to: "a2" },
      { from: "h8", to: "h7" },
      { from: "a2", to: "a1" },
      { from: "h7", to: "h8" },
      { from: "a1", to: "a2" },
      { from: "h8", to: "h7" },
      { from: "a2", to: "a1" },
      { from: "h7", to: "h8" },
    ]);

    expect(finalState.status).toBe("draw-repetition");
  });

  it("detects the fifty-move rule", () => {
    const state = createKingsOnlyState();
    setPieceAt(state.board, "a1", { color: "white", type: "rook" });
    state.halfmoveClock = 99;
    state.positionCounts = {};

    const finalState = applyMove(state, { from: "a1", to: "a2" });

    expect(finalState.status).toBe("draw-fifty-move");
  });

  it("prevents moving a pinned piece away from the king", () => {
    const state = createKingsOnlyState();
    setPieceAt(state.board, "e2", { color: "white", type: "rook" });
    setPieceAt(state.board, "e8", { color: "black", type: "rook" });
    setPieceAt(state.board, "a8", { color: "black", type: "king" });
    state.positionCounts = {};

    const moves = getLegalMoves(state, "e2");
    const lateralMoves = moves.filter((move) => move.to.startsWith("d") || move.to.startsWith("f"));

    expect(lateralMoves).toHaveLength(0);
  });

  it("detects insufficient material", () => {
    const state = createKingsOnlyState();

    expect(getGameStatus(state)).toBe("draw-insufficient-material");
  });
});
