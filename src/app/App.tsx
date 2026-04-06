import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameMenu, GameMode, Difficulty } from './components/GameMenu';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('twoPlayer');
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();

  const handleStartGame = (mode: GameMode, diff?: Difficulty) => {
    setGameMode(mode);
    setDifficulty(diff);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 p-8">
      {!gameStarted ? (
        <GameMenu onStartGame={handleStartGame} />
      ) : (
        <>
          <h1 className="text-5xl mb-8">Chess</h1>
          <ChessBoard
            gameMode={gameMode}
            difficulty={difficulty}
            onBackToMenu={handleBackToMenu}
          />
        </>
      )}
    </div>
  );
}