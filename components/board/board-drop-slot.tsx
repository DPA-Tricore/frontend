import { useDndContext } from '@dnd-kit/core';
import { BOARD_CARD_GAP_PX } from '@/lib/constants/board';

interface BoardDropSlotProps {
  /** The column's own `isOver` from useDroppable, and whether the dragged card came from this column. */
  isOver: boolean;
  isSourceColumn: boolean;
}

/**
 * Opens a card-sized gap at the top of a column while a card from another column
 * hovers it, sliding the cards below down. The top is where a dropped card lands
 * (status changes prepend it), so the gap shows the real landing spot.
 *
 * It closes instantly on drop, not animated: the optimistic update inserts the
 * card right away, so an animated close would make the cards below dip and bounce back.
 */
export default function BoardDropSlot({ isOver, isSourceColumn }: BoardDropSlotProps) {
  const { active } = useDndContext();
  // No slot in the card's own column: dropping back there changes nothing.
  const open = isOver && !!active && !isSourceColumn;
  const height = active?.rect.current.initial?.height ?? 0;

  return (
    <div
      aria-hidden
      className="shrink-0 overflow-hidden"
      style={{
        height: open ? height : 0,
        // A closed slot still gets the flex gap below it; the negative margin cancels it out.
        marginBottom: open ? 0 : -BOARD_CARD_GAP_PX,
        transition: active ? 'height 200ms ease-out, margin-bottom 200ms ease-out' : 'none',
      }}
    >
      <div className="h-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-500/5 dark:border-blue-800" />
    </div>
  );
}
