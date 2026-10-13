import type { ElementType } from 'react';

export interface NavItem {
  name: string;
  icon: ElementType;
  href: string;
  // Leave out to show the item to every role.
  roles?: string[];
}

export interface NavGroup {
  // Leave out for the top group, which has no heading and can't be folded.
  label?: string;
  items: NavItem[];
  roles?: string[];
}
