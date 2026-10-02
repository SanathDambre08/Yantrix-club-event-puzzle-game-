import { useDroppable } from '@dnd-kit/core';

interface PuzzleSlotProps {
  index: number;
  tileSize: number;
  isTray: boolean;
  children?: React.ReactNode;
}

export function PuzzleSlot({ index, tileSize, isTray, children }: PuzzleSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: index,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border-2 transition-colors relative flex items-center justify-center
        ${isOver ? 'border-accent bg-accent/20' : 'border-dashed border-border/40'}`}
      style={{
        width: tileSize,
        height: tileSize,
        background: isTray && !isOver ? 'rgba(11, 16, 32, 0.2)' : 'rgba(11, 16, 32, 0.5)',
      }}
    >
      {children}
    </div>
  );
}
