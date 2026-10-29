'use client';

import { BellOff, BellRing, Smartphone } from 'lucide-react';
import { colors } from '@/lib/theme/colors';
import { useBrowserAlerts } from '@/lib/hooks/use-browser-alerts';
import { BROWSER_ALERT_STATUS_TEXT } from '@/lib/constants/notifications';

/** Browser alerts on the device you're using right now. Each browser is turned on separately. */
export default function BrowserAlertsCard() {
  const { status, busy, enable, disable, sendTest } = useBrowserAlerts();

  const Icon = status === 'on' ? BellRing : status === 'needs-install' ? Smartphone : BellOff;
  const buttonClass = `${colors.button.secondary} text-sm disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <section className="surface rounded-xl border border-[var(--border)] shadow-sm p-6">
      <div className="flex items-start gap-4">
        <span
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'on' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-[var(--surface-2)] text-muted'
          }`}
        >
          <Icon size={20} />
        </span>

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">Browser alerts on this device</h2>
            <p className="text-sm text-muted" aria-live="polite">{BROWSER_ALERT_STATUS_TEXT[status]}</p>
          </div>

          {status === 'off' && (
            <button onClick={enable} disabled={busy} className={buttonClass}>
              {busy ? 'Turning on…' : 'Turn on browser alerts'}
            </button>
          )}

          {status === 'on' && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={sendTest} disabled={busy} className={buttonClass}>
                Send a test
              </button>
              <button onClick={disable} disabled={busy} className={buttonClass}>
                Turn off
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
