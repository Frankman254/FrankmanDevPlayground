import type { Card, Rank, Suit, Winner } from "@/features/games/blackjack/types";

const suits: Suit[] = ["C", "D", "H", "S"];
const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function createDeck() {
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, code: `${rank}${suit}` });
    }
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]) {
  const clone = [...deck];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

export function drawCard(deck: Card[]) {
  if (deck.length === 0) {
    throw new Error("No cards left in the deck.");
  }

  const nextDeck = [...deck];
  const card = nextDeck.pop();

  return { card: card!, deck: nextDeck };
}

export function getHandValue(hand: Card[]) {
  let total = 0;
  let aceCount = 0;

  hand.forEach((card) => {
    if (card.rank === "A") {
      aceCount += 1;
      total += 11;
      return;
    }

    if (["J", "Q", "K"].includes(card.rank)) {
      total += 10;
      return;
    }

    total += Number(card.rank);
  });

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  return total;
}

export function shouldHouseDraw(playerScore: number, houseScore: number) {
  if (playerScore > 21) {
    return false;
  }

  if (houseScore < 17) {
    return true;
  }

  return houseScore < playerScore && playerScore <= 21;
}

export function resolveWinner(playerScore: number, houseScore: number): Winner {
  if (playerScore > 21) {
    return "house";
  }

  if (houseScore > 21) {
    return "player";
  }

  if (playerScore === houseScore) {
    return "push";
  }

  return houseScore > playerScore ? "house" : "player";
}

export function formatWinnerMessage(winner: Winner, playerScore: number, houseScore: number) {
  const scores = `Player ${playerScore} - House ${houseScore}`;

  switch (winner) {
    case "player":
      return `You win. ${scores}`;
    case "house":
      return `House wins. ${scores}`;
    default:
      return `Push game. ${scores}`;
  }
}
