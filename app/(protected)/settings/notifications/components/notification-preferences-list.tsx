'use client';

import ToggleSwitch from '@/components/toggle-switch';
import LoadingSpinner from '@/components/loading-spinner';
import { useNotificationPreferences, useUpdateNotificationPreference } from '@/lib/hooks/use-notifications';
import { NOTIFICATION_CHANNELS } from '@/lib/constants/notifications';
import type { NotificationPreferenceType } from '@/lib/types/notifications';

/**
 * Every notification type, grouped, with a switch per channel. Each switch
 * only changes that one type on that one channel and saves straight away.
 */
export default function NotificationPreferencesList() {
  const { data, isLoading, isError } = useNotificationPreferences();

  return (
    <section className="surface rounded-xl border border-[var(--border)] shadow-sm">
      <div className="p-6 pb-4">
        <h2 className="text-lg font-semibold text-primary">What you get notified about</h2>
        <p className="text-sm text-muted">Browser switches apply to every device with browser alerts on.</p>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <p className="px-6 pb-6 text-sm text-red-600">Couldn&apos;t load your settings. Reload the page to try again.</p>}

      {data && (
        <>
          <div className="hidden sm:flex justify-end gap-5 px-6 pb-2">
            {NOTIFICATION_CHANNELS.map(({ channel, label }) => (
              <span key={channel} className="w-11 text-center text-xs font-medium text-muted">
                {label}
              </span>
            ))}
          </div>

          {data.groups.map((group) => (
            <div key={group.key} className="border-t border-[var(--border)] px-6 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle mb-3">{group.label}</h3>
              <ul className="space-y-4">
                {group.types.map((type) => (
                  <PreferenceRow key={type.type} type={type} />
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

interface PreferenceRowProps {
  type: NotificationPreferenceType;
}

function PreferenceRow({ type }: PreferenceRowProps) {
  const update = useUpdateNotificationPreference();

  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">{type.label}</p>
        <p className="text-sm text-muted">{type.description}</p>
      </div>

      <div className="flex gap-5">
        {NOTIFICATION_CHANNELS.map(({ channel, label }) => {
          const enabled = type.channels[channel];
          return (
            <div key={channel} className="w-11 flex flex-col items-center gap-1">
              <span className="sm:hidden text-xs text-muted">{label}</span>
              {enabled === undefined ? (
                <span className="h-6 flex items-center text-subtle" title={`No ${label.toLowerCase()} version of this`}>
                  —
                </span>
              ) : (
                <ToggleSwitch
                  checked={enabled}
                  onChange={(next) => update.mutate({ type: type.type, channel, enabled: next })}
                  label={`${type.label}: ${label}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </li>
  );
}
