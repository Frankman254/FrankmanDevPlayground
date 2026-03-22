import { describe, expect, it } from "vitest";

import {
  createDeck,
  getHandValue,
  resolveWinner,
  shouldHouseDraw,
} from "@/features/games/blackjack/logic";

describe("blackjack logic", () => {
  it("creates a full deck with unique cards", () => {
    const deck = createDeck();
    const codes = new Set(deck.map((card) => card.code));

    expect(deck).toHaveLength(52);
    expect(codes.size).toBe(52);
  });

  it("treats aces as flexible values", () => {
    const hand = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "9H", rank: "9", suit: "H" },
      { code: "AC", rank: "A", suit: "C" },
    ] as const;

    expect(getHandValue([...hand])).toBe(21);
  });

  it("stops the house from drawing if the player already busted", () => {
    expect(shouldHouseDraw(24, 10)).toBe(false);
  });

  it("resolves winners correctly", () => {
    expect(resolveWinner(20, 18)).toBe("player");
    expect(resolveWinner(19, 21)).toBe("house");
    expect(resolveWinner(21, 21)).toBe("push");
  });
});
