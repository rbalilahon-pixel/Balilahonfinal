export type GameMode = 'twoPlayer' | 'computer';
export type Difficulty = 800 | 1000 | 1500 | 2000 | 2500;

interface GameMenuProps {
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void;
}

export function GameMenu({ onStartGame }: GameMenuProps) {
  return (
    <div className="flex flex-col items-center gap-8 bg-white p-12 rounded-2xl shadow-2xl max-w-md w-full">
      <h1 className="text-4xl font-bold text-gray-800">Chess</h1>

      <div className="w-full flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-700">Select Game Mode</h2>

        <button
          onClick={() => onStartGame('twoPlayer')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors text-lg font-medium"
        >
          2 Players (Local)
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or play against</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mt-2">Computer Difficulty</h2>

        <DifficultyButton
          difficulty={800}
          label="Easy"
          color="bg-green-500 hover:bg-green-600"
          onStartGame={onStartGame}
        />

        <DifficultyButton
          difficulty={1000}
          label="Medium"
          color="bg-yellow-500 hover:bg-yellow-600"
          onStartGame={onStartGame}
        />

        <DifficultyButton
          difficulty={1500}
          label="Hard"
          color="bg-orange-500 hover:bg-orange-600"
          onStartGame={onStartGame}
        />

        <DifficultyButton
          difficulty={2000}
          label="Insane"
          color="bg-red-500 hover:bg-red-600"
          onStartGame={onStartGame}
        />

        <DifficultyButton
          difficulty={2500}
          label="Impossible"
          color="bg-purple-600 hover:bg-purple-700"
          onStartGame={onStartGame}
        />
      </div>
    </div>
  );
}

interface DifficultyButtonProps {
  difficulty: Difficulty;
  label: string;
  color: string;
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void;
}

function DifficultyButton({ difficulty, label, color, onStartGame }: DifficultyButtonProps) {
  return (
    <button
      onClick={() => onStartGame('computer', difficulty)}
      className={`w-full ${color} text-white px-6 py-3 rounded-lg transition-colors text-lg font-medium flex justify-between items-center`}
    >
      <span>{label}</span>
      <span className="text-sm opacity-90">{difficulty} ELO</span>
    </button>
  );
}
