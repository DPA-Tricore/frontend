'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';

// ─── Merge tags available for email templates ───────────────────────────────
const MERGE_TAGS = [
  { label: 'First Name', value: '[[First Name]]' },
  { label: 'Last Name', value: '[[Last Name]]' },
  { label: 'Full Name', value: '[[Full Name]]' },
  { label: 'Lead Status', value: '[[Lead Status]]' },
  { label: 'Lead Type', value: '[[Lead Type]]' },
  { label: 'Source', value: '[[Source]]' },
];

// ─── Toolbar button ──────────────────────────────────────────────────────────
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'text-primary hover:bg-gray-100 dark:hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write your email body here...',
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[140px] px-4 py-3 text-primary',
      },
    },
  });

  // Sync external value changes (e.g. editing existing step)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const insertMergeTag = useCallback(
    (tag: string) => {
      editor?.chain().focus().insertContent(tag).run();
    },
    [editor],
  );

  const setLink = useCallback(() => {
    const url = window.prompt('URL');
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden surface">
      {/* ── Formatting toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <s>S</s>
        </ToolbarButton>

        <span className="w-px h-4 bg-[var(--border)] mx-1" />

        <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          ≡
        </ToolbarButton>
        <ToolbarButton title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          1.
        </ToolbarButton>

        <span className="w-px h-4 bg-[var(--border)] mx-1" />

        <ToolbarButton title="Link" onClick={setLink} active={editor.isActive('link')}>
          🔗
        </ToolbarButton>
        <ToolbarButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
          ✂
        </ToolbarButton>

        <span className="w-px h-4 bg-[var(--border)] mx-1" />

        {/* ── Merge tag insert buttons ── */}
        <span className="text-xs text-subtle mr-1">Insert:</span>
        {MERGE_TAGS.map((tag) => (
          <button
            key={tag.value}
            type="button"
            title={`Insert ${tag.value}`}
            onClick={() => insertMergeTag(tag.value)}
            className="px-2 py-0.5 rounded text-xs border border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600 transition-colors font-mono"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}
