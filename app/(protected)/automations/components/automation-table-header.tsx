export default function AutomationTableHeader() {
  return (
    <thead>
      <tr className="border-b border-[var(--border)] [background:var(--bg)]">
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Stage</th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Scope</th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Steps</th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Shot Clock</th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Active</th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
      </tr>
    </thead>
  );
}
