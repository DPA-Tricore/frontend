interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

/** A titled group of fields, with a divider above every group but the first. */
export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="space-y-4 border-t border-[var(--border)] pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold text-subtle uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  );
}
