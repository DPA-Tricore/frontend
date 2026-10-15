import { defaultDropAnimationSideEffects, type DropAnimation } from '@dnd-kit/core';

/** Matches the `gap-2` between board cards. */
export const BOARD_CARD_GAP_PX = 8;

/**
 * The dragged copy glides to wherever the real card is now: the top of the new
 * column after a move, or home after a cancel. The real card stays hidden until
 * it lands, so there are never two on screen.
 */
export const BOARD_DROP_ANIMATION: DropAnimation = {
  duration: 200,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' } } }),
};
