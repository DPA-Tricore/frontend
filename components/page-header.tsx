interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  error?: string | null;
}

/** One slim row: the sidebar already says where you are, so no subtitle. */
export default function PageHeader({ title, actions, error }: PageHeaderProps) {
  return (
    <>
      {/* On a narrow screen the actions wrap under the title instead of running off the edge. */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 min-h-9">
        <h1 className="text-xl font-semibold text-primary">{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </>
  );
}
