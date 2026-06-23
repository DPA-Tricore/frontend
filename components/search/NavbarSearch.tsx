'use client';

import { Search } from 'lucide-react';

interface Props {
  onOpen: () => void;
}

export default function NavbarSearch({ onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Search (⌘K)"
      className="p-2 interactive icon-btn"
      aria-label="Open search"
    >
      <Search size={20} />
    </button>
  );
}
