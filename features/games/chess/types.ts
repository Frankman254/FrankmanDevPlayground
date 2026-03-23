export type ChessColor = "white" | "black";

export type PieceType =
  | "king"
  | "queen"
  | "rook"
  | "bishop"
  | "knight"
  | "pawn";

export type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

export type FileKey = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type RankKey = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type Square = `${FileKey}${RankKey}`;

export type Piece = {
  color: ChessColor;
  type: PieceType;
};

export type Board = (Piece | null)[][];

export type CastlingRights = Record<
  ChessColor,
  {
    kingSide: boolean;
    queenSide: boolean;
  }
>;

export type Move = {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
};

export type MoveRecord = Move & {
  piece: Piece;
  captured?: Piece;
  isCastle: boolean;
  isEnPassant: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  notation: string;
};

export type GameStatus =
  | "active"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw-repetition"
  | "draw-fifty-move"
  | "draw-insufficient-material";

export type ChessState = {
  board: Board;
  turn: ChessColor;
  castlingRights: CastlingRights;
  enPassant: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  history: MoveRecord[];
  lastMove?: MoveRecord;
  positionCounts: Record<string, number>;
  status: GameStatus;
  winner: ChessColor | null;
};
