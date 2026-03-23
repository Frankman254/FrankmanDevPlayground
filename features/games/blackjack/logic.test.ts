import { describe, expect, it } from "vitest";

import {
  canSplitHand,
  createShoe,
  getHandValue,
  getHandValueDetails,
  isNaturalBlackjack,
  resolveHandOutcome,
  resolveWinner,
  shouldDealerDraw,
} from "@/features/games/blackjack/logic";

describe("blackjack logic", () => {
  it("creates a six-deck shoe", () => {
    const shoe = createShoe(6);
    const aceOfSpadesCount = shoe.filter((card) => card.code === "AS").length;

    expect(shoe).toHaveLength(312);
    expect(aceOfSpadesCount).toBe(6);
  });

  it("treats aces as flexible values", () => {
    const hand = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "9H", rank: "9", suit: "H" },
      { code: "AC", rank: "A", suit: "C" },
    ] as const;

    expect(getHandValue([...hand])).toBe(21);
  });

  it("identifies soft totals for the dealer", () => {
    const hand = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "6H", rank: "6", suit: "H" },
    ] as const;

    expect(getHandValueDetails([...hand])).toMatchObject({
      total: 17,
      isSoft: true,
    });
  });

  it("stands on soft 17 with standard S17 rules", () => {
    const softSeventeen = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "6H", rank: "6", suit: "H" },
    ] as const;

    expect(shouldDealerDraw([...softSeventeen], "S17")).toBe(false);
  });

  it("allows splitting equal-value ten cards", () => {
    const hand = [
      { code: "10S", rank: "10", suit: "S" },
      { code: "KH", rank: "K", suit: "H" },
    ] as const;

    expect(canSplitHand([...hand])).toBe(true);
  });

  it("detects a natural blackjack", () => {
    const hand = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "KH", rank: "K", suit: "H" },
    ] as const;

    expect(isNaturalBlackjack([...hand])).toBe(true);
  });

  it("treats blackjack as a stronger result than a regular 21", () => {
    const playerBlackjack = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "KH", rank: "K", suit: "H" },
    ] as const;
    const dealerTwentyOne = [
      { code: "7S", rank: "7", suit: "S" },
      { code: "7H", rank: "7", suit: "H" },
      { code: "7D", rank: "7", suit: "D" },
    ] as const;

    expect(resolveHandOutcome([...playerBlackjack], [...dealerTwentyOne], true)).toBe(
      "blackjack",
    );
  });

  it("pushes when both player and dealer have blackjack", () => {
    const playerBlackjack = [
      { code: "AS", rank: "A", suit: "S" },
      { code: "KH", rank: "K", suit: "H" },
    ] as const;
    const dealerBlackjack = [
      { code: "AD", rank: "A", suit: "D" },
      { code: "QS", rank: "Q", suit: "S" },
    ] as const;

    expect(resolveHandOutcome([...playerBlackjack], [...dealerBlackjack], true)).toBe(
      "push",
    );
  });

  it("resolves winners correctly", () => {
    expect(resolveWinner(20, 18)).toBe("player");
    expect(resolveWinner(19, 21)).toBe("house");
    expect(resolveWinner(21, 21)).toBe("push");
  });
});
