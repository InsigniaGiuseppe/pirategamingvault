
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { activityLogger } from '@/services/activityLoggingService';
import { Bomb, Flag, RotateCcw, Trophy, Clock, Zap, Coins } from 'lucide-react';

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

const Minesweeper = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [startTime, setStartTime] = useState<number>(0);
  const [gamesPlayedToday, setGamesPlayedToday] = useState<number>(0);
  const [maxGamesPerDay, setMaxGamesPerDay] = useState<number>(3);
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();

  useEffect(() => {
    const savedGames = localStorage.getItem('minesweeperGames');
    if (savedGames) {
      const { count, date } = JSON.parse(savedGames);
      if (date === new Date().toDateString()) {
        setGamesPlayedToday(count);
      } else {
        localStorage.removeItem('minesweeperGames');
        setGamesPlayedToday(0);
      }
    }
  }, []);

  const initializeBoard = useCallback((difficulty: Difficulty) => {
    const { rows, cols, mines } = difficultySettings[difficulty];
    const newBoard: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      })
    );

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
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
        newBoard[i][j].adjacentMines = adjacentMines;
      }
    }

    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(initializeBoard(difficulty));
    setGameState('playing');
    setStartTime(Date.now());
  }, [difficulty, initializeBoard]);

  const revealCell = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[row][col].isRevealed = true;
    setBoard(newBoard);

    if (board[row][col].isMine) {
      endGame(false);
      return;
    }

    if (board[row][col].adjacentMines === 0) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (x === 0 && y === 0) continue;
          const newRow = row + x;
          const newCol = col + y;
          if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
            revealCell(newRow, newCol);
          }
        }
      }
    }

    checkWin();
  }, [board, gameState]);

  const flagCell = (row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
  };

  const checkWin = useCallback(() => {
    let unrevealedCount = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if (!board[i][j].isRevealed && !board[i][j].isMine) {
          unrevealedCount++;
        }
      }
    }

    if (unrevealedCount === 0) {
      endGame(true);
    }
  }, [board]);

  const resetGame = () => {
    setBoard(initializeBoard(difficulty));
    setGameState('playing');
    setStartTime(Date.now());
  };

  const endGame = useCallback(async (won: boolean) => {
    if (gameState !== 'playing') return;
    
    setGameState(won ? 'won' : 'lost');
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);
    
    let coinsEarned = 0;
    
    if (won && gamesPlayedToday < maxGamesPerDay) {
      coinsEarned = difficultySettings[difficulty].reward;
      await addPirateCoins(coinsEarned, `Minesweeper ${difficulty} victory`);
      setGamesPlayedToday(prev => prev + 1);
      localStorage.setItem('minesweeperGames', JSON.stringify({
        count: gamesPlayedToday + 1,
        date: new Date().toDateString()
      }));
      
      toast({
        title: won ? "Victory! 🎉" : "Game Over",
        description: won 
          ? `Congratulations! You earned ${coinsEarned} Pirate Coins!` 
          : "Better luck next time!",
      });
    } else if (won) {
      toast({
        title: "Great Game! 🎉",
        description: "You've reached your daily limit, but great job solving the puzzle!",
      });
    } else {
      toast({
        title: "Game Over",
        description: "Better luck next time!",
      });
    }

    // Log the Minesweeper game activity
    if (user?.id) {
      await activityLogger.logMinesweeperGame(
        user.id,
        difficulty,
        won,
        timeElapsed,
        coinsEarned
      );
    }
  }, [gameState, startTime, difficulty, gamesPlayedToday, maxGamesPerDay, addPirateCoins, toast, user?.id]);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Minesweeper
          <Badge variant="secondary">
            <Coins className="mr-1 h-4 w-4" />
            Reward: {difficultySettings[difficulty].reward}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="mr-1 h-4 w-4" />
            <span>Time: {Math.floor((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${difficultySettings[difficulty].cols}, 24px)` }}>
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                className={`w-6 h-6 p-0 flex items-center justify-center text-sm font-medium ${cell.isRevealed
                  ? cell.isMine
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : 'bg-blue-200 hover:bg-blue-300'
                  }`}
                variant="secondary"
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  flagCell(rowIndex, colIndex);
                }}
                disabled={gameState !== 'playing'}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <Bomb className="h-4 w-4" />
                  ) : cell.adjacentMines > 0 ? (
                    cell.adjacentMines
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag className="h-4 w-4 text-red-600" />
                ) : null}
              </Button>
            ))
          ))}
        </div>
        <div className="flex items-center justify-between">
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={gameState !== 'playing'}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Badge variant={gameState === 'won' ? 'success' : gameState === 'lost' ? 'destructive' : 'default'}>
            {gameState === 'playing' ? (
              'Playing'
            ) : gameState === 'won' ? (
              <>
                <Trophy className="mr-1 h-4 w-4" />
                Won!
              </>
            ) : (
              <>
                <Zap className="mr-1 h-4 w-4" />
                Lost!
              </>
            )}
          </Badge>
        </div>
        {gamesPlayedToday < maxGamesPerDay ? (
          <p className="text-sm text-gray-500">
            Games played today: {gamesPlayedToday} / {maxGamesPerDay}
          </p>
        ) : (
          <p className="text-sm text-yellow-500">
            You've reached your daily limit. Come back tomorrow for more rewards!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Minesweeper;
