import { Chess, Square, PieceSymbol } from 'chess.js';
import { useState, useEffect } from 'react';
import { Game as ChessEngine } from 'js-chess-engine';
import type { GameMode, Difficulty } from './GameMenu';

const WHITE_PIECES: Record<string, string> = {
  'k': '♔',
  'q': '♕',
  'r': '♖',
  'b': '♗',
  'n': '♘',
  'p': '♙',
};

const BLACK_PIECES: Record<string, string> = {
  'k': '♚',
  'q': '♛',
  'r': '♜',
  'b': '♝',
  'n': '♞',
  'p': '♟',
};

interface ChessBoardProps {
  gameMode: GameMode;
  difficulty?: Difficulty;
  onBackToMenu: () => void;
}

export function ChessBoard({ gameMode, difficulty, onBackToMenu }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  const makeComputerMove = (currentGame: Chess) => {
    if (gameMode !== 'computer' || currentGame.isGameOver()) return;

    setIsComputerThinking(true);

    setTimeout(() => {
      const moves = currentGame.moves({ verbose: true });
      if (moves.length === 0) {
        setIsComputerThinking(false);
        return;
      }

      let selectedMove;

      // Adjust move selection based on difficulty (ELO)
      if (difficulty === 800) {
        // Easy: mostly random moves with occasional good moves
        selectedMove = Math.random() < 0.8
          ? moves[Math.floor(Math.random() * moves.length)]
          : getBestMove(currentGame, 1);
      } else if (difficulty === 1000) {
        // Medium: random with some strategy
        selectedMove = Math.random() < 0.5
          ? moves[Math.floor(Math.random() * moves.length)]
          : getBestMove(currentGame, 1);
      } else if (difficulty === 1500) {
        // Hard: mostly strategic moves
        selectedMove = Math.random() < 0.3
          ? moves[Math.floor(Math.random() * moves.length)]
          : getBestMove(currentGame, 2);
      } else if (difficulty === 2000) {
        // Insane: always strategic with deeper analysis
        selectedMove = getBestMove(currentGame, 3);
      } else {
        // Impossible: best possible moves
        selectedMove = getBestMove(currentGame, 4);
      }

      currentGame.move(selectedMove);
      setGame(new Chess(currentGame.fen()));
      setIsComputerThinking(false);
    }, 500); // Slight delay to make it feel more natural
  };

  const getBestMove = (currentGame: Chess, depth: number) => {
    const moves = currentGame.moves({ verbose: true });
    let bestMove = moves[0];
    let bestValue = -Infinity;

    for (const move of moves) {
      const gameCopy = new Chess(currentGame.fen());
      gameCopy.move(move);
      const value = evaluatePosition(gameCopy, depth - 1, false);

      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  };

  const evaluatePosition = (currentGame: Chess, depth: number, isMaximizing: boolean): number => {
    if (depth === 0 || currentGame.isGameOver()) {
      return evaluateBoard(currentGame);
    }

    const moves = currentGame.moves({ verbose: true });
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      const gameCopy = new Chess(currentGame.fen());
      gameCopy.move(move);
      const value = evaluatePosition(gameCopy, depth - 1, !isMaximizing);

      if (isMaximizing) {
        bestValue = Math.max(bestValue, value);
      } else {
        bestValue = Math.min(bestValue, value);
      }
    }

    return bestValue;
  };

  const evaluateBoard = (currentGame: Chess): number => {
    if (currentGame.isCheckmate()) {
      return currentGame.turn() === 'w' ? -1000 : 1000;
    }
    if (currentGame.isDraw()) return 0;

    const pieceValues: Record<string, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let score = 0;
    const board = currentGame.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type];
          score += piece.color === 'b' ? value : -value;
        }
      }
    }

    return score;
  };

  const handleSquareClick = (square: Square) => {
    if (isComputerThinking) return;
    if (gameMode === 'computer' && game.turn() === 'b') return; // Don't allow player to move computer's pieces

    if (selectedSquare) {
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // Always promote to queen for simplicity
        });

        if (move) {
          const newGame = new Chess(game.fen());
          setGame(newGame);
          setSelectedSquare(null);
          setValidMoves([]);

          // Trigger computer move if playing against computer
          if (gameMode === 'computer' && !newGame.isGameOver()) {
            makeComputerMove(newGame);
          }
          return;
        }
      } catch (error) {
        // Invalid move, try selecting the new square instead
      }
    }

    // Select new piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      // In computer mode, only allow selecting white pieces
      if (gameMode === 'computer' && piece.color === 'b') return;

      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setValidMoves([]);
    setIsComputerThinking(false);
  };

  useEffect(() => {
    // If computer starts first (shouldn't happen in this setup, but just in case)
    if (gameMode === 'computer' && game.turn() === 'b' && !game.isGameOver()) {
      makeComputerMove(game);
    }
  }, []);

  const board = game.board();
  const isCheck = game.isCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  const isGameOver = game.isGameOver();

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getDifficultyLabel = () => {
    if (gameMode !== 'computer' || !difficulty) return '';
    const labels: Record<Difficulty, string> = {
      800: 'Easy',
      1000: 'Medium',
      1500: 'Hard',
      2000: 'Insane',
      2500: 'Impossible',
    };
    return labels[difficulty];
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="text-lg text-gray-600">
          {gameMode === 'twoPlayer'
            ? 'Two Player Mode'
            : `vs Computer (${getDifficultyLabel()} - ${difficulty} ELO)`}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-semibold">
            {isComputerThinking ? (
              <span className="text-blue-600">Computer is thinking...</span>
            ) : (
              <>
                {game.turn() === 'w' ? 'White' : 'Black'} to move
              </>
            )}
          </div>
          {isCheck && !isCheckmate && (
            <div className="bg-yellow-500 text-white px-3 py-1 rounded">Check!</div>
          )}
        </div>
      </div>

      {isGameOver && (
        <div className="bg-red-500 text-white px-4 py-2 rounded text-xl">
          {isCheckmate && `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`}
          {isStalemate && 'Stalemate!'}
          {isDraw && !isStalemate && 'Draw!'}
        </div>
      )}

      <div className="inline-flex flex-col border-4 border-gray-800 shadow-xl">
        {ranks.map((rank, rowIndex) => (
          <div key={rank} className="flex">
            {files.map((file, colIndex) => {
              const square = `${file}${rank}` as Square;
              const piece = board[rowIndex][colIndex];
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isValidMove = validMoves.includes(square);

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`
                    w-16 h-16 flex items-center justify-center cursor-pointer relative
                    ${isLight ? 'bg-amber-100' : 'bg-amber-700'}
                    ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                    hover:opacity-80 transition-opacity
                  `}
                >
                  {piece && (
                    <div
                      className={`text-5xl select-none ${
                        piece.color === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-black'
                      }`}
                    >
                      {piece.color === 'w' ? WHITE_PIECES[piece.type] : BLACK_PIECES[piece.type]}
                    </div>
                  )}
                  {isValidMove && (
                    <div
                      className={`absolute w-4 h-4 rounded-full ${
                        piece ? 'border-4 border-green-500 w-full h-full' : 'bg-green-500 bg-opacity-50'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          New Game
        </button>
        <button
          onClick={onBackToMenu}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Menu
        </button>
      </div>

      <div className="flex gap-8">
        <CapturedPieces game={game} color="b" />
        <CapturedPieces game={game} color="w" />
      </div>
    </div>
  );
}

function CapturedPieces({ game, color }: { game: Chess; color: 'w' | 'b' }) {
  const history = game.history({ verbose: true });
  const captured: string[] = [];

  history.forEach(move => {
    if (move.captured && move.color !== color) {
      const symbol = color === 'w'
        ? WHITE_PIECES[move.captured]
        : BLACK_PIECES[move.captured];
      captured.push(symbol);
    }
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold">
        {color === 'w' ? 'White' : 'Black'} Captured
      </div>
      <div className="flex flex-wrap gap-1 min-h-[40px] bg-gray-100 p-2 rounded">
        {captured.map((piece, index) => (
          <span key={index} className="text-2xl">
            {piece}
          </span>
        ))}
      </div>
    </div>
  );
}
