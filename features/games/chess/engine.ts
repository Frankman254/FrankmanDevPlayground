import type {
  Board,
  CastlingRights,
  ChessColor,
  ChessState,
  FileKey,
  GameStatus,
  Move,
  MoveRecord,
  Piece,
  PieceType,
  PromotionPiece,
  RankKey,
  Square,
} from "@/features/games/chess/types";

export const BOARD_FILES: FileKey[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const BOARD_RANKS: RankKey[] = ["8", "7", "6", "5", "4", "3", "2", "1"];
export const PROMOTION_PIECES: PromotionPiece[] = ["queen", "rook", "bishop", "knight"];

const INITIAL_CASTLING_RIGHTS: CastlingRights = {
  white: { kingSide: true, queenSide: true },
  black: { kingSide: true, queenSide: true },
};

const PIECE_TO_SYMBOL: Record<PieceType, string> = {
  king: "K",
  queen: "Q",
  rook: "R",
  bishop: "B",
  knight: "N",
  pawn: "",
};

type Coordinates = {
  x: number;
  y: number;
};

type ExecutedMove = {
  captured?: Piece;
  isCastle: boolean;
  isEnPassant: boolean;
  piece: Piece;
  state: ChessState;
};

export function createEmptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

export function createInitialChessState(): ChessState {
  const board = createEmptyBoard();
  const backRank: PieceType[] = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];

  backRank.forEach((type, index) => {
    board[0][index] = { color: "black", type };
    board[1][index] = { color: "black", type: "pawn" };
    board[6][index] = { color: "white", type: "pawn" };
    board[7][index] = { color: "white", type };
  });

  return createTrackedState({
    board,
    castlingRights: cloneCastlingRights(INITIAL_CASTLING_RIGHTS),
    enPassant: null,
    fullmoveNumber: 1,
    halfmoveClock: 0,
    history: [],
    positionCounts: {},
    status: "active",
    turn: "white",
    winner: null,
  });
}

export function createEmptyChessState(): ChessState {
  return createTrackedState({
    board: createEmptyBoard(),
    castlingRights: {
      white: { kingSide: false, queenSide: false },
      black: { kingSide: false, queenSide: false },
    },
    enPassant: null,
    fullmoveNumber: 1,
    halfmoveClock: 0,
    history: [],
    positionCounts: {},
    status: "active",
    turn: "white",
    winner: null,
  });
}

export function getPieceAt(state: ChessState, square: Square) {
  const { x, y } = squareToCoordinates(square);
  return state.board[y][x];
}

export function setPieceAt(board: Board, square: Square, piece: Piece | null) {
  const { x, y } = squareToCoordinates(square);
  board[y][x] = piece ? { ...piece } : null;
}

export function getOpponentColor(color: ChessColor): ChessColor {
  return color === "white" ? "black" : "white";
}

export function getSquareColor(square: Square) {
  const { x, y } = squareToCoordinates(square);
  return (x + y) % 2 === 0 ? "light" : "dark";
}

export function getLegalMoves(state: ChessState, from?: Square): Move[] {
  const candidates: Move[] = [];

  if (from) {
    const piece = getPieceAt(state, from);

    if (!piece || piece.color !== state.turn) {
      return [];
    }

    candidates.push(...generatePseudoLegalMoves(state, from, piece));
  } else {
    for (const square of getAllSquares()) {
      const piece = getPieceAt(state, square);

      if (piece?.color === state.turn) {
        candidates.push(...generatePseudoLegalMoves(state, square, piece));
      }
    }
  }

  return candidates.filter((move) => {
    const piece = getPieceAt(state, move.from);

    if (!piece) {
      return false;
    }

    const nextState = executeMove(state, move).state;
    return !isInCheck(nextState, piece.color);
  });
}

export function applyMove(state: ChessState, move: Move): ChessState {
  if (!isPlayableStatus(state.status)) {
    return state;
  }

  const piece = getPieceAt(state, move.from);

  if (!piece || piece.color !== state.turn) {
    return state;
  }

  const legalMove = selectLegalMove(getLegalMoves(state, move.from), move);

  if (!legalMove) {
    return state;
  }

  const executed = executeMove(state, legalMove);
  const nextPositionKey = getPositionKey(executed.state);
  const positionCounts = {
    ...state.positionCounts,
    [nextPositionKey]: (state.positionCounts[nextPositionKey] ?? 0) + 1,
  };
  const withTracking = {
    ...executed.state,
    positionCounts,
  };
  const status = getGameStatus(withTracking);
  const isCheck = status === "check" || status === "checkmate";
  const isCheckmate = status === "checkmate";
  const notation = formatMoveNotation(state, legalMove, executed, isCheck, isCheckmate);
  const moveRecord: MoveRecord = {
    ...legalMove,
    piece: executed.piece,
    captured: executed.captured,
    isCastle: executed.isCastle,
    isCheck,
    isCheckmate,
    isEnPassant: executed.isEnPassant,
    notation,
  };

  return {
    ...withTracking,
    history: [...state.history, moveRecord],
    lastMove: moveRecord,
    status,
    winner: status === "checkmate" ? state.turn : null,
  };
}

export function isInCheck(state: ChessState, color: ChessColor) {
  const kingSquare = findKingSquare(state.board, color);

  if (!kingSquare) {
    return false;
  }

  return isSquareAttacked(state.board, kingSquare, getOpponentColor(color));
}

export function getGameStatus(state: ChessState): GameStatus {
  const legalMoves = getLegalMoves({
    ...state,
    status: "active",
  });
  const inCheck = isInCheck(state, state.turn);

  if (legalMoves.length === 0) {
    return inCheck ? "checkmate" : "stalemate";
  }

  if (state.halfmoveClock >= 100) {
    return "draw-fifty-move";
  }

  const key = getPositionKey(state);

  if ((state.positionCounts[key] ?? 0) >= 3) {
    return "draw-repetition";
  }

  if (hasInsufficientMaterial(state.board)) {
    return "draw-insufficient-material";
  }

  return inCheck ? "check" : "active";
}

export function getCapturedPieces(state: ChessState, color: ChessColor) {
  return state.history
    .filter((move) => move.captured && move.piece.color === color)
    .map((move) => move.captured!);
}

export function getPositionKey(state: ChessState) {
  const boardKey = state.board
    .map((row) => {
      let emptyCount = 0;
      let rowKey = "";

      row.forEach((piece) => {
        if (!piece) {
          emptyCount += 1;
          return;
        }

        if (emptyCount > 0) {
          rowKey += String(emptyCount);
          emptyCount = 0;
        }

        const symbol = PIECE_TO_SYMBOL[piece.type] || "P";
        rowKey += piece.color === "white" ? symbol : symbol.toLowerCase();
      });

      if (emptyCount > 0) {
        rowKey += String(emptyCount);
      }

      return rowKey;
    })
    .join("/");
  const turnKey = state.turn === "white" ? "w" : "b";
  const castlingKey = getCastlingKey(state.castlingRights);
  const enPassantKey = state.enPassant ?? "-";

  return `${boardKey} ${turnKey} ${castlingKey} ${enPassantKey}`;
}

function createTrackedState(state: ChessState): ChessState {
  const key = getPositionKey(state);

  return {
    ...state,
    positionCounts: {
      [key]: 1,
      ...state.positionCounts,
    },
  };
}

function generatePseudoLegalMoves(state: ChessState, from: Square, piece: Piece) {
  switch (piece.type) {
    case "pawn":
      return getPawnMoves(state, from, piece.color);
    case "knight":
      return getKnightMoves(state, from, piece.color);
    case "bishop":
      return getSlidingMoves(state, from, piece.color, [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]);
    case "rook":
      return getSlidingMoves(state, from, piece.color, [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ]);
    case "queen":
      return getSlidingMoves(state, from, piece.color, [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ]);
    case "king":
      return getKingMoves(state, from, piece.color);
  }
}

function getPawnMoves(state: ChessState, from: Square, color: ChessColor) {
  const { x, y } = squareToCoordinates(from);
  const direction = color === "white" ? -1 : 1;
  const startRank = color === "white" ? 6 : 1;
  const promotionRank = color === "white" ? 0 : 7;
  const moves: Move[] = [];
  const nextY = y + direction;

  if (isInsideBoard(x, nextY) && !state.board[nextY][x]) {
    const targetSquare = coordinatesToSquare(x, nextY);
    pushMoveWithPromotion(moves, from, targetSquare, nextY === promotionRank);

    const doubleStepY = y + direction * 2;

    if (y === startRank && !state.board[doubleStepY][x]) {
      moves.push({
        from,
        to: coordinatesToSquare(x, doubleStepY),
      });
    }
  }

  for (const offsetX of [-1, 1]) {
    const targetX = x + offsetX;
    const targetY = y + direction;

    if (!isInsideBoard(targetX, targetY)) {
      continue;
    }

    const targetSquare = coordinatesToSquare(targetX, targetY);
    const targetPiece = state.board[targetY][targetX];

    if (targetPiece && targetPiece.color !== color) {
      pushMoveWithPromotion(moves, from, targetSquare, targetY === promotionRank);
      continue;
    }

    if (state.enPassant === targetSquare) {
      moves.push({ from, to: targetSquare });
    }
  }

  return moves;
}

function getKnightMoves(state: ChessState, from: Square, color: ChessColor) {
  const { x, y } = squareToCoordinates(from);
  const moves: Move[] = [];
  const deltas = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [offsetX, offsetY] of deltas) {
    const targetX = x + offsetX;
    const targetY = y + offsetY;

    if (!isInsideBoard(targetX, targetY)) {
      continue;
    }

    const targetPiece = state.board[targetY][targetX];

    if (!targetPiece || targetPiece.color !== color) {
      moves.push({
        from,
        to: coordinatesToSquare(targetX, targetY),
      });
    }
  }

  return moves;
}

function getSlidingMoves(
  state: ChessState,
  from: Square,
  color: ChessColor,
  directions: number[][],
) {
  const { x, y } = squareToCoordinates(from);
  const moves: Move[] = [];

  for (const [offsetX, offsetY] of directions) {
    let currentX = x + offsetX;
    let currentY = y + offsetY;

    while (isInsideBoard(currentX, currentY)) {
      const targetPiece = state.board[currentY][currentX];

      if (!targetPiece) {
        moves.push({
          from,
          to: coordinatesToSquare(currentX, currentY),
        });
        currentX += offsetX;
        currentY += offsetY;
        continue;
      }

      if (targetPiece.color !== color) {
        moves.push({
          from,
          to: coordinatesToSquare(currentX, currentY),
        });
      }

      break;
    }
  }

  return moves;
}

function getKingMoves(state: ChessState, from: Square, color: ChessColor) {
  const { x, y } = squareToCoordinates(from);
  const moves: Move[] = [];

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      const targetX = x + offsetX;
      const targetY = y + offsetY;

      if (!isInsideBoard(targetX, targetY)) {
        continue;
      }

      const targetPiece = state.board[targetY][targetX];

      if (!targetPiece || targetPiece.color !== color) {
        moves.push({
          from,
          to: coordinatesToSquare(targetX, targetY),
        });
      }
    }
  }

  moves.push(...getCastleMoves(state, color));

  return moves;
}

function getCastleMoves(state: ChessState, color: ChessColor) {
  const moves: Move[] = [];
  const rank = color === "white" ? "1" : "8";
  const enemy = getOpponentColor(color);
  const kingFrom = `e${rank}` as Square;

  if (isInCheck(state, color)) {
    return moves;
  }

  if (
    state.castlingRights[color].kingSide &&
    hasPiece(state.board, kingFrom, { color, type: "king" }) &&
    hasPiece(state.board, `h${rank}` as Square, { color, type: "rook" }) &&
    isSquareEmpty(state.board, `f${rank}` as Square) &&
    isSquareEmpty(state.board, `g${rank}` as Square) &&
    !isSquareAttacked(state.board, `f${rank}` as Square, enemy) &&
    !isSquareAttacked(state.board, `g${rank}` as Square, enemy)
  ) {
    moves.push({ from: kingFrom, to: `g${rank}` as Square });
  }

  if (
    state.castlingRights[color].queenSide &&
    hasPiece(state.board, kingFrom, { color, type: "king" }) &&
    hasPiece(state.board, `a${rank}` as Square, { color, type: "rook" }) &&
    isSquareEmpty(state.board, `b${rank}` as Square) &&
    isSquareEmpty(state.board, `c${rank}` as Square) &&
    isSquareEmpty(state.board, `d${rank}` as Square) &&
    !isSquareAttacked(state.board, `c${rank}` as Square, enemy) &&
    !isSquareAttacked(state.board, `d${rank}` as Square, enemy)
  ) {
    moves.push({ from: kingFrom, to: `c${rank}` as Square });
  }

  return moves;
}

function executeMove(state: ChessState, move: Move): ExecutedMove {
  const board = cloneBoard(state.board);
  const piece = getBoardPiece(board, move.from);

  if (!piece) {
    throw new Error("No se puede ejecutar un movimiento sin pieza.");
  }

  const { x: fromX, y: fromY } = squareToCoordinates(move.from);
  const { x: toX, y: toY } = squareToCoordinates(move.to);
  let captured = getBoardPiece(board, move.to) ?? undefined;
  let isEnPassant = false;
  let isCastle = false;

  board[fromY][fromX] = null;

  if (
    piece.type === "pawn" &&
    fromX !== toX &&
    !captured &&
    state.enPassant === move.to
  ) {
    const capturedPawnY = piece.color === "white" ? toY + 1 : toY - 1;
    captured = board[capturedPawnY][toX] ?? undefined;
    board[capturedPawnY][toX] = null;
    isEnPassant = true;
  }

  if (piece.type === "king" && Math.abs(toX - fromX) === 2) {
    isCastle = true;

    if (toX > fromX) {
      board[toY][5] = board[toY][7];
      board[toY][7] = null;
    } else {
      board[toY][3] = board[toY][0];
      board[toY][0] = null;
    }
  }

  const movedPiece =
    piece.type === "pawn" && move.promotion
      ? { color: piece.color, type: move.promotion }
      : piece;

  board[toY][toX] = movedPiece;

  const castlingRights = cloneCastlingRights(state.castlingRights);

  if (piece.type === "king") {
    castlingRights[piece.color].kingSide = false;
    castlingRights[piece.color].queenSide = false;
  }

  if (piece.type === "rook") {
    removeRookCastlingRight(castlingRights, piece.color, move.from);
  }

  if (captured?.type === "rook") {
    removeRookCastlingRight(castlingRights, captured.color, move.to);
  }

  const enPassant =
    piece.type === "pawn" && Math.abs(toY - fromY) === 2
      ? coordinatesToSquare(fromX, (fromY + toY) / 2)
      : null;
  const halfmoveClock =
    piece.type === "pawn" || captured ? 0 : state.halfmoveClock + 1;
  const fullmoveNumber =
    state.turn === "black" ? state.fullmoveNumber + 1 : state.fullmoveNumber;

  return {
    captured,
    isCastle,
    isEnPassant,
    piece,
    state: {
      ...state,
      board,
      castlingRights,
      enPassant,
      fullmoveNumber,
      halfmoveClock,
      turn: getOpponentColor(state.turn),
      winner: null,
    },
  };
}

function isSquareAttacked(board: Board, square: Square, attackingColor: ChessColor) {
  const { x, y } = squareToCoordinates(square);
  const pawnDirection = attackingColor === "white" ? -1 : 1;

  for (const offsetX of [-1, 1]) {
    const attackerX = x - offsetX;
    const attackerY = y - pawnDirection;

    if (!isInsideBoard(attackerX, attackerY)) {
      continue;
    }

    const piece = board[attackerY][attackerX];

    if (piece?.color === attackingColor && piece.type === "pawn") {
      return true;
    }
  }

  const knightOffsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [offsetX, offsetY] of knightOffsets) {
    const targetX = x + offsetX;
    const targetY = y + offsetY;

    if (!isInsideBoard(targetX, targetY)) {
      continue;
    }

    const piece = board[targetY][targetX];

    if (piece?.color === attackingColor && piece.type === "knight") {
      return true;
    }
  }

  const orthogonalDirections = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  for (const [offsetX, offsetY] of orthogonalDirections) {
    if (isSlidingAttack(board, x, y, offsetX, offsetY, attackingColor, ["rook", "queen"])) {
      return true;
    }
  }

  const diagonalDirections = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  for (const [offsetX, offsetY] of diagonalDirections) {
    if (
      isSlidingAttack(board, x, y, offsetX, offsetY, attackingColor, ["bishop", "queen"])
    ) {
      return true;
    }
  }

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      const targetX = x + offsetX;
      const targetY = y + offsetY;

      if (!isInsideBoard(targetX, targetY)) {
        continue;
      }

      const piece = board[targetY][targetX];

      if (piece?.color === attackingColor && piece.type === "king") {
        return true;
      }
    }
  }

  return false;
}

function isSlidingAttack(
  board: Board,
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  color: ChessColor,
  allowedTypes: PieceType[],
) {
  let currentX = x + offsetX;
  let currentY = y + offsetY;

  while (isInsideBoard(currentX, currentY)) {
    const piece = board[currentY][currentX];

    if (!piece) {
      currentX += offsetX;
      currentY += offsetY;
      continue;
    }

    return piece.color === color && allowedTypes.includes(piece.type);
  }

  return false;
}

function findKingSquare(board: Board, color: ChessColor) {
  for (const square of getAllSquares()) {
    const piece = getBoardPiece(board, square);

    if (piece?.color === color && piece.type === "king") {
      return square;
    }
  }

  return null;
}

function hasInsufficientMaterial(board: Board) {
  const pieces = getAllSquares()
    .map((square) => ({ piece: getBoardPiece(board, square), square }))
    .filter((entry) => entry.piece && entry.piece.type !== "king") as Array<{
    piece: Piece;
    square: Square;
  }>;

  if (pieces.length === 0) {
    return true;
  }

  if (pieces.length === 1) {
    return ["bishop", "knight"].includes(pieces[0].piece.type);
  }

  if (pieces.length === 2) {
    if (pieces.every((entry) => entry.piece.type === "knight")) {
      return pieces[0].piece.color === pieces[1].piece.color;
    }

    if (pieces.every((entry) => entry.piece.type === "bishop")) {
      return getSquareColor(pieces[0].square) === getSquareColor(pieces[1].square);
    }
  }

  return false;
}

function selectLegalMove(legalMoves: Move[], attemptedMove: Move) {
  return legalMoves.find((legalMove) => {
    if (legalMove.from !== attemptedMove.from || legalMove.to !== attemptedMove.to) {
      return false;
    }

    if (attemptedMove.promotion) {
      return legalMove.promotion === attemptedMove.promotion;
    }

    return !legalMove.promotion || legalMove.promotion === "queen";
  });
}

function formatMoveNotation(
  previousState: ChessState,
  move: Move,
  executed: ExecutedMove,
  isCheck: boolean,
  isCheckmate: boolean,
) {
  if (executed.isCastle) {
    return `${move.to[0] === "g" ? "O-O" : "O-O-O"}${getStatusSuffix(isCheck, isCheckmate)}`;
  }

  const pieceSymbol = PIECE_TO_SYMBOL[executed.piece.type];
  const captureMarker = executed.captured ? "x" : "-";
  const pawnPrefix =
    executed.piece.type === "pawn" && executed.captured ? move.from[0] : "";
  const promotionSuffix = move.promotion ? `=${PIECE_TO_SYMBOL[move.promotion]}` : "";
  const notationBase =
    executed.piece.type === "pawn"
      ? `${pawnPrefix}${captureMarker === "-" ? "" : captureMarker}${move.to}`
      : `${pieceSymbol}${move.from}${captureMarker}${move.to}`;

  if (executed.piece.type === "pawn" && !executed.captured) {
    return `${move.to}${promotionSuffix}${getStatusSuffix(isCheck, isCheckmate)}`;
  }

  return `${notationBase}${promotionSuffix}${getStatusSuffix(isCheck, isCheckmate)}`;
}

function getStatusSuffix(isCheck: boolean, isCheckmate: boolean) {
  if (isCheckmate) {
    return "#";
  }

  return isCheck ? "+" : "";
}

function removeRookCastlingRight(
  castlingRights: CastlingRights,
  color: ChessColor,
  square: Square,
) {
  if (color === "white") {
    if (square === "a1") {
      castlingRights.white.queenSide = false;
    }

    if (square === "h1") {
      castlingRights.white.kingSide = false;
    }
  } else {
    if (square === "a8") {
      castlingRights.black.queenSide = false;
    }

    if (square === "h8") {
      castlingRights.black.kingSide = false;
    }
  }
}

function pushMoveWithPromotion(
  moves: Move[],
  from: Square,
  to: Square,
  shouldPromote: boolean,
) {
  if (!shouldPromote) {
    moves.push({ from, to });
    return;
  }

  PROMOTION_PIECES.forEach((promotion) => {
    moves.push({ from, to, promotion });
  });
}

function getCastlingKey(castlingRights: CastlingRights) {
  const value = [
    castlingRights.white.kingSide ? "K" : "",
    castlingRights.white.queenSide ? "Q" : "",
    castlingRights.black.kingSide ? "k" : "",
    castlingRights.black.queenSide ? "q" : "",
  ].join("");

  return value || "-";
}

function cloneCastlingRights(castlingRights: CastlingRights): CastlingRights {
  return {
    white: { ...castlingRights.white },
    black: { ...castlingRights.black },
  };
}

function getAllSquares(): Square[] {
  const squares: Square[] = [];

  BOARD_RANKS.forEach((rank) => {
    BOARD_FILES.forEach((file) => {
      squares.push(`${file}${rank}` as Square);
    });
  });

  return squares;
}

function getBoardPiece(board: Board, square: Square) {
  const { x, y } = squareToCoordinates(square);
  return board[y][x];
}

function isSquareEmpty(board: Board, square: Square) {
  return !getBoardPiece(board, square);
}

function hasPiece(board: Board, square: Square, expected: Piece) {
  const piece = getBoardPiece(board, square);
  return piece?.color === expected.color && piece.type === expected.type;
}

function isPlayableStatus(status: GameStatus) {
  return status === "active" || status === "check";
}

function squareToCoordinates(square: Square): Coordinates {
  const file = square[0] as FileKey;
  const rank = square[1] as RankKey;

  return {
    x: BOARD_FILES.indexOf(file),
    y: 8 - Number(rank),
  };
}

function coordinatesToSquare(x: number, y: number): Square {
  return `${BOARD_FILES[x]}${8 - y}` as Square;
}

function isInsideBoard(x: number, y: number) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}
