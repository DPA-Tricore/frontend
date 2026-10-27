import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title?: string;
  message: string;
  children: React.ReactNode;
}

/** Fills a card's spare space with a next step, so a short list doesn't leave a hole. */
export default function DashboardPrompt({ icon: Icon, title, message, children }: Props) {
  return (
    <div className="flex-1 min-h-36 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--border)] px-4 py-6 text-center">
      <Icon size={20} className="text-subtle" />
      <div>
        {title && <p className="text-sm font-medium text-primary">{title}</p>}
        <p className="text-sm text-muted">{message}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  );
}
