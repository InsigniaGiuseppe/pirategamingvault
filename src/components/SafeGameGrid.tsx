
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from './ErrorBoundary';
import GameGrid from './GameGrid';

const GameGridErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Card className="max-w-2xl mx-auto mt-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <AlertTriangle size={20} />
        Games Section Error
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-gray-600">
        The games section encountered an error and couldn't load properly.
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Gamepad2 size={16} />
        <span>Error: {error.message}</span>
      </div>
      <Button onClick={resetErrorBoundary} className="w-full">
        <RefreshCw size={16} className="mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
);

const SafeGameGrid = () => {
  return (
    <ErrorBoundary fallback={<GameGridErrorFallback error={new Error('Unknown error')} resetErrorBoundary={() => window.location.reload()} />}>
      <GameGrid />
    </ErrorBoundary>
  );
};

export default SafeGameGrid;
