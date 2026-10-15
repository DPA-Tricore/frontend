'use client';

import { useState } from 'react';

const ROLL_CLASS = { up: 'animate-count-up', down: 'animate-count-down' } as const;

/**
 * A number that rolls to its new value instead of swapping in place.
 * No animation on first render, only on change.
 */
export default function AnimatedCount({ value }: { value: number }) {
  // Direction is derived during render (not in an effect) so the new number
  // mounts with the right animation on its very first frame.
  const [prev, setPrev] = useState(value);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  if (value !== prev) {
    setDirection(value > prev ? 'up' : 'down');
    setPrev(value);
  }

  return (
    <span className="inline-block overflow-hidden align-bottom tabular-nums">
      <span key={value} className={`inline-block ${direction ? ROLL_CLASS[direction] : ''}`}>
        {value}
      </span>
    </span>
  );
}
