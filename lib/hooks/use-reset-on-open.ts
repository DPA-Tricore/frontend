import { useState } from 'react';

/**
 * Runs `reset` when a modal goes from closed to open, so every opening starts
 * from a clean form. It runs during render (React's "adjust state when a prop
 * changes" pattern), so the first frame already shows the reset values, and a
 * refetch that swaps the item while the modal is open never wipes the user's edits.
 */
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) reset();
  }
}
