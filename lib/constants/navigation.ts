import {
  BarChart3,
  TrendingUp,
  CheckSquare,
  Bell,
  Star,
  GitBranch,
  Paperclip,
  FileBarChart,
  Users,
  Contact,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import type { NavGroup } from '@/lib/types/navigation';

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
      { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
      { name: 'Reminders', icon: Bell, href: '/reminders' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { name: 'Leads', icon: TrendingUp, href: '/leads' },
      { name: 'Customers', icon: Contact, href: '/customers' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { name: 'Automations', icon: GitBranch, href: '/automations' },
      { name: 'Reviews', icon: Star, href: '/reviews' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { name: 'Documents', icon: Paperclip, href: '/documents' },
      { name: 'Reports', icon: FileBarChart, href: '/reports' },
    ],
  },
  {
    label: 'Admin',
    roles: ['ORG_ADMIN'],
    items: [
      { name: 'Team', icon: Users, href: '/team' },
      { name: 'Audit Log', icon: ShieldCheck, href: '/audit-log' },
      { name: 'Billing', icon: CreditCard, href: '/billing' },
    ],
  },
];

export const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed';
export const SIDEBAR_FOLDED_GROUPS_KEY = 'sidebar:folded-groups';
