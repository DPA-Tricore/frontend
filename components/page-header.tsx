interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  error?: string | null;
}

export default function PageHeader({ title, subtitle, actions, error }: PageHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </>
  );
}
