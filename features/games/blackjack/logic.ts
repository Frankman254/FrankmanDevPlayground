import type {
  Card,
  DealerRule,
  HandOutcome,
  Rank,
  Suit,
  Winner,
} from "@/features/games/blackjack/types";

const suits: Suit[] = ["C", "D", "H", "S"];
const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const tenValueRanks = new Set<Rank>(["10", "J", "Q", "K"]);

export function createDeck(deckCount = 1) {
  const deck: Card[] = [];

  for (let currentDeck = 0; currentDeck < deckCount; currentDeck += 1) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, code: `${rank}${suit}` });
      }
    }
  }

  return shuffleDeck(deck);
}

export function createShoe(deckCount = 6) {
  return createDeck(deckCount);
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
    throw new Error("No quedan cartas en el mazo.");
  }

  const nextDeck = [...deck];
  const card = nextDeck.pop();

  return { card: card!, deck: nextDeck };
}

export function getCardValue(card: Card) {
  if (card.rank === "A") {
    return 11;
  }

  if (tenValueRanks.has(card.rank)) {
    return 10;
  }

  return Number(card.rank);
}

export function getHandValue(hand: Card[]) {
  return getHandValueDetails(hand).total;
}

export function getHandValueDetails(hand: Card[]) {
  let total = 0;
  let aceCount = 0;

  hand.forEach((card) => {
    if (card.rank === "A") {
      aceCount += 1;
      total += 11;
      return;
    }

    if (tenValueRanks.has(card.rank)) {
      total += 10;
      return;
    }

    total += Number(card.rank);
  });

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  return {
    total,
    isSoft: aceCount > 0,
    isBlackjack: hand.length === 2 && total === 21,
  };
}

export function isNaturalBlackjack(hand: Card[]) {
  return hand.length === 2 && getHandValue(hand) === 21;
}

export function canSplitHand(hand: Card[]) {
  if (hand.length !== 2) {
    return false;
  }

  return getSplitValue(hand[0]) === getSplitValue(hand[1]);
}

export function shouldDealerDraw(hand: Card[], rule: DealerRule = "S17") {
  const { isSoft, total } = getHandValueDetails(hand);

  if (total < 17) {
    return true;
  }

  if (total > 17) {
    return false;
  }

  return rule === "H17" && isSoft;
}

export function isDealerPeekCard(card: Card) {
  return card.rank === "A" || tenValueRanks.has(card.rank);
}

export function canOfferInsurance(card?: Card) {
  return card?.rank === "A";
}

export function resolveHandOutcome(
  playerHand: Card[],
  dealerHand: Card[],
  playerHasNaturalBlackjack = isNaturalBlackjack(playerHand),
): HandOutcome {
  const playerScore = getHandValue(playerHand);
  const dealerScore = getHandValue(dealerHand);
  const dealerHasBlackjack = isNaturalBlackjack(dealerHand);

  if (playerScore > 21) {
    return "lose";
  }

  if (dealerHasBlackjack) {
    return playerHasNaturalBlackjack ? "push" : "lose";
  }

  if (playerHasNaturalBlackjack) {
    return "blackjack";
  }

  if (dealerScore > 21 || playerScore > dealerScore) {
    return "win";
  }

  if (playerScore === dealerScore) {
    return "push";
  }

  return "lose";
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
  const scores = `Jugador ${playerScore} - Casa ${houseScore}`;

  switch (winner) {
    case "player":
      return `Ganaste. ${scores}`;
    case "house":
      return `La casa gana. ${scores}`;
    default:
      return `Empate. ${scores}`;
  }
}

function getSplitValue(card: Card) {
  if (card.rank === "A") {
    return 11;
  }

  if (tenValueRanks.has(card.rank)) {
    return 10;
  }

  return Number(card.rank);
}
