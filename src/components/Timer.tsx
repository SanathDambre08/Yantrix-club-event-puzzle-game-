import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '../lib/scoring';

interface TimerProps {
  isRunning: boolean;
  startTimeString?: string;
  onTick?: (seconds: number) => void;
  className?: string;
}

export function Timer({ isRunning, startTimeString, onTick, className = '' }: TimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(undefined as any);

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return;

    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - startTimeRef.current) / 1000));
    setElapsedSeconds(elapsed);
    onTick?.(elapsed);

    rafRef.current = requestAnimationFrame(tick);
  }, [onTick]);

  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === null) {
        startTimeRef.current = startTimeString ? new Date(startTimeString).getTime() : Date.now();
      }
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning, tick]);

  const isWarning = elapsedSeconds >= 120; // 2 minutes
  const isDanger = elapsedSeconds >= 300; // 5 minutes

  return (
    <div
      className={`flex items-center gap-2 font-mono text-lg font-bold transition-colors duration-300
        ${isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-text'}
        ${className}`}
    >
      <Clock
        size={20}
        className={`${isRunning ? 'animate-pulse' : ''}`}
      />
      <span>{formatTime(elapsedSeconds)}</span>
    </div>
  );
}
