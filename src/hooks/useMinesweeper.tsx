
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { activityLogger } from '@/services/activityLoggingService';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'playing' | 'won' | 'lost';

const difficultySettings = {
  easy: { rows: 9, cols: 9, mines: 10, reward: 5 },
  medium: { rows: 16, cols: 16, mines: 40, reward: 10 },
  hard: { rows: 16, cols: 30, mines: 99, reward: 20 },
};

export const useMinesweeper = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [gamesPlayedToday, setGamesPlayedToday] = useState<number>(0);
  
  const maxGamesPerDay = 3;
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();

  const gridCols = useMemo(() => difficultySettings[difficulty].cols, [difficulty]);

  useEffect(() => {
    const savedGames = localStorage.getItem('minesweeperGames');
    if (savedGames) {
      try {
        const { count, date } = JSON.parse(savedGames);
        if (date === new Date().toDateString()) {
          setGamesPlayedToday(count);
        } else {
          localStorage.removeItem('minesweeperGames');
          setGamesPlayedToday(0);
        }
      } catch (e) {
        setGamesPlayedToday(0);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && startTime > 0) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, startTime]);

  const initializeBoard = useCallback((difficulty: Difficulty) => {
    const { rows, cols, mines } = difficultySettings[difficulty];
    const newBoard: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col] = { ...newBoard[row][col], isMine: true };
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let adjacentMines = 0;
          for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
              if (x === 0 && y === 0) continue;
              const newRow = i + x;
              const newCol = j + y;
              if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && newBoard[newRow][newCol].isMine) {
                adjacentMines++;
              }
            }
          }
          newBoard[i][j] = { ...newBoard[i][j], adjacentMines };
        }
      }
    }

    return newBoard;
  }, []);

  const revealCell = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || board[row]?.[col]?.isRevealed || board[row]?.[col]?.isFlagged) {
      return;
    }

    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.map(cell => ({ ...cell })));
      
      const reveal = (r: number, c: number) => {
        if (r < 0 || r >= newBoard.length || c < 0 || c >= newBoard[0].length || newBoard[r][c].isRevealed) {
          return;
        }
        
        newBoard[r][c].isRevealed = true;
        
        if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
          for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
              if (x !== 0 || y !== 0) {
                reveal(r + x, c + y);
              }
            }
          }
        }
      };
      
      reveal(row, col);
      return newBoard;
    });

    if (board[row][col].isMine) {
      setGameState('lost');
    }
  }, [board, gameState]);

  const flagCell = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || board[row]?.[col]?.isRevealed) {
      return;
    }

    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.map(cell => ({ ...cell })));
      newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
      return newBoard;
    });
  }, [board, gameState]);

  const resetGame = useCallback(() => {
    setBoard(initializeBoard(difficulty));
    setGameState('playing');
    setStartTime(Date.now());
    setCurrentTime(Date.now());
  }, [difficulty, initializeBoard]);

  // Check win condition
  useEffect(() => {
    if (gameState === 'playing' && board.length > 0) {
      let unrevealedCount = 0;
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
          if (!board[i][j].isRevealed && !board[i][j].isMine) {
            unrevealedCount++;
          }
        }
      }

      if (unrevealedCount === 0) {
        setGameState('won');
      }
    }
  }, [board, gameState]);

  // Handle game end
  useEffect(() => {
    if (gameState !== 'playing' && startTime > 0) {
      const endTime = Date.now();
      const timeElapsed = Math.floor((endTime - startTime) / 1000);
      
      if (gameState === 'won' && gamesPlayedToday < maxGamesPerDay) {
        const coinsEarned = difficultySettings[difficulty].reward;
        addPirateCoins(coinsEarned, `Minesweeper ${difficulty} victory`);
        setGamesPlayedToday(prev => prev + 1);
        localStorage.setItem('minesweeperGames', JSON.stringify({
          count: gamesPlayedToday + 1,
          date: new Date().toDateString()
        }));
        
        toast({
          title: "Victory! 🎉",
          description: `Congratulations! You earned ${coinsEarned} Pirate Coins!`,
        });

        if (user?.id) {
          activityLogger.logMinesweeperGame(user.id, difficulty, true, timeElapsed, coinsEarned);
        }
      } else if (gameState === 'won') {
        toast({
          title: "Great Game! 🎉",
          description: "You've reached your daily limit, but great job solving the puzzle!",
        });
      } else {
        toast({
          title: "Game Over",
          description: "Better luck next time!",
        });

        if (user?.id) {
          activityLogger.logMinesweeperGame(user.id, difficulty, false, timeElapsed, 0);
        }
      }
    }
  }, [gameState, startTime, difficulty, gamesPlayedToday, addPirateCoins, toast, user?.id]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  const elapsedTime = Math.floor((currentTime - startTime) / 1000);

  return {
    // State
    board,
    difficulty,
    gameState,
    gamesPlayedToday,
    maxGamesPerDay,
    elapsedTime,
    gridCols,
    
    // Actions
    revealCell,
    flagCell,
    resetGame,
    setDifficulty,
    
    // Config
    difficultySettings
  };
};
