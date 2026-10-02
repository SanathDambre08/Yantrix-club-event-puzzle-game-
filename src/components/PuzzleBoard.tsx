import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { PuzzleTile } from './PuzzleTile';
import { PuzzleSlot } from './PuzzleSlot';
import { moveTile, isSolved, GRID_SIZE, TOTAL_TILES } from '../lib/puzzle';

interface PuzzleBoardProps {
  initialTiles: number[];
  initialMoveCount?: number;
  imageUrl: string;
  onMove: (tiles: number[], moveCount: number) => void;
  onComplete: (tiles: number[], moveCount: number) => void;
  isActive: boolean;
  boardSize?: number;
}

export function PuzzleBoard({
  initialTiles,
  initialMoveCount = 0,
  imageUrl,
  onMove,
  onComplete,
  isActive,
  boardSize = 300,
}: PuzzleBoardProps) {
  const [tiles, setTiles] = useState<number[]>(initialTiles);
  const [moveCount, setMoveCount] = useState(initialMoveCount);
  const [isCompleted, setIsCompleted] = useState(false);

  const gap = 4;
  const tileSize = (boardSize - gap * (GRID_SIZE - 1)) / GRID_SIZE;

  // Initialize sensors for mobile touch & desktop mouse
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5, // No delay, picks up instantly after dragging 5 pixels!
      },
    })
  );

  useEffect(() => {
    setTiles(initialTiles);
    setMoveCount(initialMoveCount);
    setIsCompleted(false);
  }, [initialTiles, initialMoveCount]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !isActive || isCompleted) {
        return;
      }

      const fromIndex = active.id as number;
      const toIndex = over.id as number;

      const newTiles = moveTile(tiles, fromIndex, toIndex);
      if (!newTiles) return;

      const newMoveCount = moveCount + 1;
      setTiles(newTiles);
      setMoveCount(newMoveCount);
      onMove(newTiles, newMoveCount);

      if (isSolved(newTiles)) {
        setIsCompleted(true);
        // Trigger confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF2A85', '#8A2BE2', '#4169E1', '#00FFFF'],
        });
        onComplete(newTiles, newMoveCount);
      }
    },
    [tiles, isActive, isCompleted, moveCount, onMove, onComplete]
  );

  const renderGrid = (startIndex: number, title: string, isTray: boolean) => {
    return (
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-display text-text/80">{title}</h3>
        <div
          className={`relative inline-grid rounded-xl p-2 bg-surface/80 border-2 transition-all duration-500
            ${!isTray && isCompleted ? 'border-success shadow-glow-success' : 'border-border'}
          `}
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            gap: `${gap}px`,
          }}
          role="grid"
          aria-label={title}
        >
          {Array.from({ length: TOTAL_TILES }).map((_, localIndex) => {
            const globalIndex = startIndex + localIndex;
            const value = tiles[globalIndex];

            return (
              <PuzzleSlot
                key={`slot-${globalIndex}`}
                index={globalIndex}
                tileSize={tileSize}
                isTray={isTray}
              >
                {value !== 0 && (
                  <PuzzleTile
                    value={value}
                    index={globalIndex}
                    imageUrl={imageUrl}
                    isCompleted={isCompleted}
                    tileSize={tileSize}
                  />
                )}
              </PuzzleSlot>
            );
          })}

          {/* Target board background effect when solved */}
          {!isTray && isCompleted && (
            <div className="absolute inset-0 bg-success/20 rounded-xl pointer-events-none transition-colors duration-1000" />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 p-4">
          {renderGrid(0, 'Target Board', false)}
          {renderGrid(TOTAL_TILES, 'Pieces Tray', true)}
        </div>
      </DndContext>

      {/* Beautiful Completion Pop-up */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm scale-in">
          <div className="bg-surface border-2 border-accent/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-glow-accent relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
            
            <h2 className="text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary mb-4 relative z-10">
              You Made Yani!
            </h2>
            <p className="text-text/80 mb-8 relative z-10 text-lg">
              Great job assembling the robot. You completed it in <strong className="text-accent">{moveCount}</strong> moves!
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="relative z-10 w-full py-3 px-6 rounded-full bg-gradient-to-r from-accent to-primary text-white font-bold text-lg hover:shadow-glow-accent transition-all duration-300 transform hover:-translate-y-1"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
