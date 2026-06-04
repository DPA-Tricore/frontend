interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12 surface rounded-lg border border-[var(--border)]">
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-muted">{message}</p>
    </div>
  );
}
