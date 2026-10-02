import { useDraggable } from '@dnd-kit/core';
import { getTileImagePosition, GRID_SIZE } from '../lib/puzzle';

interface PuzzleTileProps {
  value: number;
  index: number;
  imageUrl: string;
  isCompleted: boolean;
  tileSize: number;
}

export function PuzzleTile({
  value,
  index,
  imageUrl,
  isCompleted,
  tileSize,
}: PuzzleTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: index,
    disabled: isCompleted,
    data: { value }
  });

  const { backgroundPositionX, backgroundPositionY } = getTileImagePosition(value);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
  } : {};

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute top-0 left-0 rounded-md overflow-hidden border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent touch-none
        ${isDragging 
          ? 'border-accent shadow-[0_0_15px_rgba(255,42,133,0.6)] scale-105 opacity-80 cursor-grabbing' 
          : !isCompleted
            ? 'border-primary/30 hover:border-primary cursor-grab'
            : 'border-success/40 cursor-default'}
      `}
      style={{
        ...style,
        width: tileSize,
        height: tileSize,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
        backgroundPositionX,
        backgroundPositionY,
      }}
      disabled={isCompleted}
      aria-label={`Puzzle piece ${value}`}
    >
      {!imageUrl && (
        <span className="flex items-center justify-center w-full h-full text-xl font-bold text-text bg-surface">
          {value}
        </span>
      )}
    </button>
  );
}
