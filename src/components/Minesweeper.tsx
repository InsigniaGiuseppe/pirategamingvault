
import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bomb, Flag, Clock, RotateCcw, Coins } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  reward: number;
}

const difficulties: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, reward: 5 },
  medium: { rows: 16, cols: 16, mines: 40, reward: 15 },
  hard: { rows: 16, cols: 30, mines: 99, reward: 30 }
};

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [dailyPlays, setDailyPlays] = useState(0);
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();

  const config = difficulties[difficulty];
  const maxDailyPlays = 5;

  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(`${user.username}_minesweeper_${today}`);
      setDailyPlays(stored ? parseInt(stored) : 0);
    }
  }, [user]);

  useEffect(() => {
    let interval: number;
    if (gameStarted && gameStatus === 'playing') {
      interval = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameStatus]);

  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = [];
    for (let row = 0; row < config.rows; row++) {
      newBoard[row] = [];
      for (let col = 0; col < config.cols; col++) {
        newBoard[row][col] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);
      
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (newRow >= 0 && newRow < config.rows && 
                  newCol >= 0 && newCol < config.cols && 
                  newBoard[newRow][newCol].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameStatus('playing');
    setFlagsUsed(0);
    setTimeElapsed(0);
    setGameStarted(false);
  }, [config]);

  useEffect(() => {
    initializeBoard();
  }, [difficulty, initializeBoard]);

  const revealCell = (row: number, col: number) => {
    if (gameStatus !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newBoard = [...board];
    
    if (newBoard[row][col].isMine) {
      // Game over
      setGameStatus('lost');
      // Reveal all mines
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }
    } else {
      // Flood fill for empty cells
      const toReveal: [number, number][] = [[row, col]];
      const visited = new Set<string>();

      while (toReveal.length > 0) {
        const [currentRow, currentCol] = toReveal.pop()!;
        const key = `${currentRow}-${currentCol}`;
        
        if (visited.has(key)) continue;
        visited.add(key);

        if (currentRow < 0 || currentRow >= config.rows || 
            currentCol < 0 || currentCol >= config.cols ||
            newBoard[currentRow][currentCol].isRevealed ||
            newBoard[currentRow][currentCol].isFlagged ||
            newBoard[currentRow][currentCol].isMine) {
          continue;
        }

        newBoard[currentRow][currentCol].isRevealed = true;

        // If it's an empty cell, reveal neighbors
        if (newBoard[currentRow][currentCol].neighborMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              toReveal.push([currentRow + dr, currentCol + dc]);
            }
          }
        }
      }

      // Check win condition
      let cellsToReveal = 0;
      let revealedCells = 0;
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (!newBoard[r][c].isMine) {
            cellsToReveal++;
            if (newBoard[r][c].isRevealed) {
              revealedCells++;
            }
          }
        }
      }

      if (cellsToReveal === revealedCells) {
        setGameStatus('won');
        handleWin();
      }
    }

    setBoard(newBoard);
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    const wasFlagged = newBoard[row][col].isFlagged;
    newBoard[row][col].isFlagged = !wasFlagged;
    
    setFlagsUsed(prev => wasFlagged ? prev - 1 : prev + 1);
    setBoard(newBoard);
  };

  const handleWin = () => {
    if (dailyPlays < maxDailyPlays && user) {
      const reward = config.reward;
      const timeBonus = Math.max(0, Math.floor((300 - timeElapsed) / 30)); // Bonus for fast completion
      const totalReward = reward + timeBonus;
      
      addPirateCoins(totalReward, `Minesweeper ${difficulty} victory (${timeElapsed}s)`);
      
      // Update daily plays
      const today = new Date().toDateString();
      const newDailyPlays = dailyPlays + 1;
      localStorage.setItem(`${user.username}_minesweeper_${today}`, newDailyPlays.toString());
      setDailyPlays(newDailyPlays);
      
      toast({
        title: "Victory!",
        description: `You earned ${totalReward} coins! (${reward} base + ${timeBonus} time bonus)`,
        duration: 4000,
      });
    } else {
      toast({
        title: "Victory!",
        description: "Great job! You've reached your daily coin limit for Minesweeper.",
        duration: 3000,
      });
    }
  };

  const getCellDisplay = (cell: Cell, row: number, col: number) => {
    if (cell.isFlagged) {
      return <Flag size={12} className="text-red-500" />;
    }
    
    if (!cell.isRevealed) {
      return '';
    }
    
    if (cell.isMine) {
      return <Bomb size={12} className="text-red-600" />;
    }
    
    if (cell.neighborMines === 0) {
      return '';
    }
    
    return cell.neighborMines;
  };

  const getCellClassName = (cell: Cell) => {
    let className = "w-6 h-6 border border-gray-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ";
    
    if (cell.isRevealed) {
      if (cell.isMine) {
        className += "bg-red-500 text-white ";
      } else {
        className += "bg-gray-100 ";
        // Color based on number
        if (cell.neighborMines === 1) className += "text-blue-600 ";
        else if (cell.neighborMines === 2) className += "text-green-600 ";
        else if (cell.neighborMines === 3) className += "text-red-600 ";
        else if (cell.neighborMines === 4) className += "text-purple-600 ";
        else if (cell.neighborMines === 5) className += "text-yellow-600 ";
        else if (cell.neighborMines === 6) className += "text-pink-600 ";
        else if (cell.neighborMines === 7) className += "text-black ";
        else if (cell.neighborMines === 8) className += "text-gray-600 ";
      }
    } else {
      className += "bg-gray-300 hover:bg-gray-200 ";
    }
    
    return className;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2">
          <Bomb size={20} />
          Minesweeper
        </CardTitle>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {Object.entries(difficulties).map(([diff, config]) => (
              <Button
                key={diff}
                variant={difficulty === diff ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficulty(diff as Difficulty)}
                disabled={gameStatus === 'playing' && gameStarted}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)} ({config.reward} coins)
              </Button>
            ))}
          </div>
          
          <Button onClick={initializeBoard} size="sm" variant="outline">
            <RotateCcw size={14} className="mr-1" />
            New Game
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bomb size={12} />
            Mines: {config.mines - flagsUsed}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock size={12} />
            Time: {formatTime(timeElapsed)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Coins size={12} />
            Daily Plays: {dailyPlays}/{maxDailyPlays}
          </Badge>
        </div>
        
        {gameStatus === 'won' && (
          <div className="text-green-600 font-medium">
            🎉 Victory! Time: {formatTime(timeElapsed)}
          </div>
        )}
        
        {gameStatus === 'lost' && (
          <div className="text-red-600 font-medium">
            💥 Game Over! Try again.
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-center">
          <div 
            className="inline-grid gap-0 border-2 border-gray-600"
            style={{ 
              gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
              maxWidth: '100%',
              overflow: 'auto'
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(cell)}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onContextMenu={(e) => toggleFlag(e, rowIndex, colIndex)}
                >
                  {getCellDisplay(cell, rowIndex, colIndex)}
                </div>
              ))
            )}
          </div>
        </div>
        
        {dailyPlays >= maxDailyPlays && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 font-medium">
              You've reached your daily coin limit for Minesweeper!
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              Come back tomorrow to earn more coins, or try watching videos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Minesweeper;
