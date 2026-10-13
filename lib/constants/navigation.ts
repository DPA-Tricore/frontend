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
  Package,
  Receipt,
} from 'lucide-react';
import type { NavGroup } from '@/lib/types/navigation';
import { PRODUCT_MANAGER_ROLES } from '@/lib/constants/products';

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
      { name: 'Invoices', icon: Receipt, href: '/invoices' },
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
    items: [
      { name: 'Products', icon: Package, href: '/products', roles: PRODUCT_MANAGER_ROLES },
      { name: 'Team', icon: Users, href: '/team', roles: ['ORG_ADMIN'] },
      { name: 'Audit Log', icon: ShieldCheck, href: '/audit-log', roles: ['ORG_ADMIN'] },
      { name: 'Billing', icon: CreditCard, href: '/billing', roles: ['ORG_ADMIN'] },
    ],
  },
];

export const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed';
export const SIDEBAR_FOLDED_GROUPS_KEY = 'sidebar:folded-groups';
