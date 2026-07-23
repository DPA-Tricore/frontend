'use client';

import { cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  type View,
  type ToolbarProps,
  type EventProps,
  type DateCellWrapperProps,
} from 'react-big-calendar';
import withDragAndDrop, { type EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMonths, addWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Clock, AlertCircle, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import SlideModal from '@/components/slide-modal';
import { getReminderStatusColor } from '@/lib/theme/colors';
import { formatDate, formatTime, getTimeLeft } from '@/lib/utils/date';
import type { ReminderResponseDto, ReminderStatus } from '@/lib/types/reminders';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ReminderResponseDto;
}

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(BigCalendar);

const statusIcon: Record<ReminderStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  TRIGGERED: <AlertCircle className="w-4 h-4" />,
  ACKNOWLEDGED: <CheckCircle className="w-4 h-4" />,
  DISMISSED: <XCircle className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />,
};

const statusDotColor: Record<ReminderStatus, string> = {
  PENDING: 'bg-yellow-500',
  TRIGGERED: 'bg-red-500',
  ACKNOWLEDGED: 'bg-blue-500',
  DISMISSED: 'bg-gray-400',
  CANCELLED: 'bg-gray-400',
};

// react-big-calendar's own stylesheet sets `.rbc-event { color: #fff }` as
// unlayered CSS, which beats any Tailwind utility class (utilities live in a
// named cascade layer, and unlayered CSS always wins regardless of source
// order). Inline styles are the only thing guaranteed to win over that, so
// week/day event coloring uses CSS vars via style, not Tailwind classNames.
const statusEventStyle: Record<ReminderStatus, { backgroundColor: string; color: string }> = {
  PENDING: { backgroundColor: 'var(--reminder-pending-bg)', color: 'var(--reminder-pending-fg)' },
  TRIGGERED: { backgroundColor: 'var(--reminder-triggered-bg)', color: 'var(--reminder-triggered-fg)' },
  ACKNOWLEDGED: { backgroundColor: 'var(--reminder-acknowledged-bg)', color: 'var(--reminder-acknowledged-fg)' },
  DISMISSED: { backgroundColor: 'var(--reminder-dismissed-bg)', color: 'var(--reminder-dismissed-fg)' },
  CANCELLED: { backgroundColor: 'var(--reminder-dismissed-bg)', color: 'var(--reminder-dismissed-fg)' },
};

const VIEW_OPTIONS: { key: View; label: string }[] = [
  { key: Views.DAY, label: 'Day' },
  { key: Views.WEEK, label: 'Week' },
  { key: Views.MONTH, label: 'Month' },
];

function CalendarToolbar({ label, view, onNavigate, onView }: ToolbarProps<CalendarEvent, object>) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg surface text-primary hover:opacity-70 transition-colors"
        >
          Today
        </button>
        <div className="flex items-center">
          <button
            onClick={() => onNavigate('PREV')}
            aria-label="Previous"
            className="p-2 rounded-full text-muted hover:text-primary hover:bg-[var(--surface-2)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            aria-label="Next"
            className="p-2 rounded-full text-muted hover:text-primary hover:bg-[var(--surface-2)] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-2xl font-semibold text-primary">{label}</h2>
      </div>

      <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
        {VIEW_OPTIONS.map((opt, i) => (
          <button
            key={opt.key}
            onClick={() => onView(opt.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-[var(--border)]' : ''} ${
              view === opt.key ? 'bg-gray-900 text-white' : 'surface text-muted hover:text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthEvent({ event }: EventProps<CalendarEvent>) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColor[event.resource.status]}`} />
      <span className="truncate">{event.title}</span>
    </div>
  );
}

interface ReminderCalendarViewProps {
  reminders: ReminderResponseDto[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule: (id: string, reminderTime: string) => void;
  onCreateAt: (date: Date) => void;
}

// Matches the subset of react-big-calendar's internal `slotMetrics` API we use.
interface SlotMetrics {
  closestSlotFromPoint: (point: { x: number; y: number }, boundaryRect: DOMRect) => Date;
}

interface DayColumnWrapperProps {
  date: Date;
  className?: string;
  style?: React.CSSProperties;
  slotMetrics: SlotMetrics;
  children?: React.ReactNode;
}

export default function ReminderCalendarView({
  reminders,
  onAcknowledge,
  onDismiss,
  onDelete,
  onReschedule,
  onCreateAt,
}: ReminderCalendarViewProps) {
  const [selected, setSelected] = useState<ReminderResponseDto | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: Date } | null>(null);
  const wheelCooldown = useRef(false);

  // Close the right-click menu on Escape, or if the visible range changes
  // (navigating away from the cell it was opened on).
  useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [contextMenu]);

  useEffect(() => {
    setContextMenu(null);
  }, [view, date]);

  // Month-view cells only carry a date (midnight), so default to a sensible
  // time of day; week/day time slots carry the exact time the user right-clicked.
  const handleCellContextMenu = useCallback((cellDate: Date, e: React.MouseEvent) => {
    e.preventDefault();
    const prefill = new Date(cellDate);
    prefill.setHours(9, 0, 0, 0);
    setContextMenu({ x: e.clientX, y: e.clientY, date: prefill });
  }, []);

  // Memoized with stable-callback deps so react-big-calendar sees the same
  // component reference across renders — an inline component here would give
  // every cell/slot a new type each render and force a remount (the same
  // flicker class of bug already fixed elsewhere in this file).
  //
  // Cloning the existing child (rather than wrapping it in a new div) keeps
  // .rbc-day-bg cells as direct DOM siblings of each other — react-big-calendar's
  // vertical grid border is `.rbc-day-bg + .rbc-day-bg`, an adjacent-sibling
  // selector that only matches actual DOM siblings, not elements that merely
  // render adjacently (a `display: contents` wrapper here broke exactly that).
  const dateCellWrapper = useMemo(() => {
    return function DateCellWrapper({ value, children }: DateCellWrapperProps) {
      return cloneElement(children, {
        onContextMenu: (e: React.MouseEvent) => handleCellContextMenu(value, e),
      });
    };
  }, [handleCellContextMenu]);

  // Week/day time grids render an absolutely-positioned .rbc-events-container
  // on top of the individual .rbc-time-slot cells, so a wrapper around each
  // slot never actually receives the click. Wrapping the whole day column
  // instead (one level up, above that overlay) does receive it; slotMetrics
  // (react-big-calendar's own point-to-time math) then converts the click's
  // Y position into the exact time slot, the same way its internal
  // click-to-select-range logic does.
  const dayColumnWrapper = useMemo(() => {
    return forwardRef<HTMLDivElement, DayColumnWrapperProps>(function DayColumnWrapper(
      { className, style, slotMetrics, children },
      ref
    ) {
      return (
        <div
          ref={ref}
          className={className}
          style={style}
          onContextMenu={(e) => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const slotDate = slotMetrics.closestSlotFromPoint({ x: e.clientX, y: e.clientY }, rect);
            setContextMenu({ x: e.clientX, y: e.clientY, date: slotDate });
          }}
        >
          {children}
        </div>
      );
    });
  }, []);

  // Trackpad/scroll-wheel gesture navigation: vertical scroll flips the month,
  // horizontal scroll flips the week. A cooldown window ignores the flood of
  // wheel events a single gesture fires so one swipe moves one page, not five.
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelCooldown.current) return;
      const WHEEL_THRESHOLD = 40;
      const COOLDOWN_MS = 500;

      if (view === Views.MONTH && Math.abs(e.deltaY) > WHEEL_THRESHOLD) {
        wheelCooldown.current = true;
        setDate((d) => addMonths(d, e.deltaY > 0 ? 1 : -1));
        setTimeout(() => { wheelCooldown.current = false; }, COOLDOWN_MS);
      } else if (view === Views.WEEK && Math.abs(e.deltaX) > WHEEL_THRESHOLD) {
        wheelCooldown.current = true;
        setDate((d) => addWeeks(d, e.deltaX > 0 ? 1 : -1));
        setTimeout(() => { wheelCooldown.current = false; }, COOLDOWN_MS);
      }
    },
    [view]
  );

  const events = useMemo<CalendarEvent[]>(
    () =>
      reminders.map((r) => {
        const start = new Date(r.reminderTime);
        return {
          id: r.id,
          title: r.title,
          start,
          end: new Date(start.getTime() + 30 * 60000),
          resource: r,
        };
      }),
    [reminders]
  );

  const eventPropGetter = useCallback(
    (event: CalendarEvent) =>
      view === Views.MONTH
        ? { className: 'rounded px-1 hover:bg-[var(--surface-2)]' }
        : { style: { ...statusEventStyle[event.resource.status], borderRadius: '4px' } },
    [view]
  );

  const handleEventDrop = useCallback(
    ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      const newStart = start instanceof Date ? start : new Date(start);
      onReschedule(event.id, newStart.toISOString());
    },
    [onReschedule]
  );

  const isActionable = selected?.status === 'PENDING' || selected?.status === 'TRIGGERED';

  return (
    <>
      <div
        className="surface border border-[var(--border)] rounded-lg p-6 h-[calc(100vh-180px)]"
        onWheel={handleWheel}
      >
        <DnDCalendar
          localizer={localizer}
          events={events}
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          popup
          resizable={false}
          eventPropGetter={eventPropGetter}
          onEventDrop={handleEventDrop}
          onSelectEvent={(event) => setSelected(event.resource)}
          components={{
            toolbar: CalendarToolbar,
            month: { event: MonthEvent },
            dateCellWrapper,
            // react-big-calendar's own type for dayColumnWrapper is an untyped
            // React.ComponentType<{}>, too loose to accept our actual props
            // without a cast.
            dayColumnWrapper: dayColumnWrapper as unknown as React.ComponentType,
          }}
          style={{ height: '100%' }}
        />
      </div>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            className="fixed z-50 surface border border-[var(--border)] rounded-lg shadow-lg py-1"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => {
                onCreateAt(contextMenu.date);
                setContextMenu(null);
              }}
              className="w-full whitespace-nowrap text-left px-4 py-2 text-sm text-primary hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          </div>
        </>
      )}

      <SlideModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? 'Reminder'}
      >
        {selected && (
          <div className="space-y-4">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getReminderStatusColor(selected.status)}`}
            >
              {statusIcon[selected.status]}
              {selected.status}
            </span>

            {selected.description && <p className="text-sm text-muted">{selected.description}</p>}

            <div className="text-sm text-muted space-y-1">
              <div>Due: {formatDate(selected.dueDate)}</div>
              <div>
                Remind at: {formatDate(selected.reminderTime)} {formatTime(selected.reminderTime)}
              </div>
              <div>{getTimeLeft(selected.reminderTime)}</div>
            </div>

            <div className="flex gap-2 pt-2">
              {isActionable && (
                <>
                  <button
                    onClick={() => {
                      onAcknowledge(selected.id);
                      setSelected(null);
                    }}
                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      onDismiss(selected.id);
                      setSelected(null);
                    }}
                    className="text-xs px-3 py-1.5 surface border border-[var(--border)] text-primary rounded hover:opacity-70 transition-colors"
                  >
                    Dismiss
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onDelete(selected.id);
                  setSelected(null);
                }}
                className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        )}
      </SlideModal>
    </>
  );
}
