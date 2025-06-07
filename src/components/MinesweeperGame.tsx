
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bomb, Flag, RotateCcw, Trophy, Clock, Zap, Coins } from 'lucide-react';
import { useMinesweeper } from '@/hooks/useMinesweeper';

const MinesweeperGame = () => {
  const {
    board,
    difficulty,
    gameState,
    gamesPlayedToday,
    maxGamesPerDay,
    elapsedTime,
    gridCols,
    revealCell,
    flagCell,
    resetGame,
    setDifficulty,
    difficultySettings
  } = useMinesweeper();

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
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="mr-1 h-4 w-4" />
            <span>Time: {elapsedTime}s</span>
          </div>
        </div>
        
        <div 
          className="grid gap-0.5 mx-auto" 
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, 24px)`,
            maxWidth: `${gridCols * 26}px`
          }}
        >
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                className={`w-6 h-6 p-0 flex items-center justify-center text-sm font-medium ${
                  cell.isRevealed
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            disabled={gameState !== 'playing'}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Badge variant={gameState === 'won' ? 'default' : gameState === 'lost' ? 'destructive' : 'secondary'}>
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

export default MinesweeperGame;
