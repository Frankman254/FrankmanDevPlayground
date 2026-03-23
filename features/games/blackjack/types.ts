export type Suit = "C" | "D" | "H" | "S";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Card = {
  suit: Suit;
  rank: Rank;
  code: `${Rank}${Suit}`;
};

export type Winner = "player" | "house" | "push";
export type DealerRule = "S17" | "H17";
export type HandOutcome = "blackjack" | "win" | "lose" | "push";
