import {
  Mail, Phone, MessageCircle, Share2, Send, Briefcase, AtSign, Camera, Globe, HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { ContactType } from '@/lib/types/leads';

export const CONTACT_ICONS: Record<ContactType, LucideIcon> = {
  [ContactType.EMAIL]: Mail,
  [ContactType.PHONE]: Phone,
  [ContactType.WHATSAPP]: MessageCircle,
  [ContactType.FACEBOOK]: Share2,
  [ContactType.TELEGRAM]: Send,
  [ContactType.LINKEDIN]: Briefcase,
  [ContactType.TWITTER]: AtSign,
  [ContactType.INSTAGRAM]: Camera,
  [ContactType.WEBSITE]: Globe,
  [ContactType.OTHER]: HelpCircle,
};

export const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-rose-500', 'bg-cyan-500',
];

export const ASSIGNABLE_ROLES = ['AGENT', 'MANAGER'];
export const CAN_ASSIGN_ROLES = ['ORG_ADMIN', 'MANAGER'];

export const LEAD_TYPE_OPTIONS = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'WARM_LEAD', label: 'Warm Lead' },
  { value: 'QUALIFIED_LEAD', label: 'Qualified Lead' },
  { value: 'OPPORTUNITY', label: 'Opportunity' },
];

/** Offered as suggestions only — source is free text, so agencies can use their own. */
export const LEAD_SOURCE_SUGGESTIONS = [
  'Referral',
  'Walk-in',
  'Phone call',
  'Website',
  'Facebook',
  'Event',
  'Existing customer',
];

/** Blank create-lead form. Coverage stays a string until submit, so the input can be empty. */
export const NEW_LEAD_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  leadType: 'PROSPECT',
  source: '',
  coverageAmount: '',
  budgetRange: '',
  assignedAgentId: '',
};

/** Forward pipeline stages, in order. LOST/UNRESPONSIVE are branch states, shown separately. */
export const LEAD_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION', 'CONVERTED'] as const;

export const LEAD_STAGE_DOT_COLORS: Record<(typeof LEAD_STAGES)[number], string> = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-amber-500',
  QUALIFIED: 'bg-emerald-500',
  IN_NEGOTIATION: 'bg-violet-500',
  CONVERTED: 'bg-teal-500',
};

/** Viewers can see contacts but not change them — matches the backend contact routes. */
export const CONTACT_EDITOR_ROLES = ['ORG_ADMIN', 'MANAGER', 'AGENT'];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  [ContactType.EMAIL]: 'Email',
  [ContactType.PHONE]: 'Phone',
  [ContactType.WHATSAPP]: 'WhatsApp',
  [ContactType.FACEBOOK]: 'Facebook',
  [ContactType.TELEGRAM]: 'Telegram',
  [ContactType.LINKEDIN]: 'LinkedIn',
  [ContactType.TWITTER]: 'Twitter / X',
  [ContactType.INSTAGRAM]: 'Instagram',
  [ContactType.WEBSITE]: 'Website',
  [ContactType.OTHER]: 'Other',
};

export const CONTACT_VALUE_PLACEHOLDERS: Partial<Record<ContactType, string>> = {
  [ContactType.EMAIL]: 'john@example.com',
  [ContactType.PHONE]: '+1 555 0100',
  [ContactType.WHATSAPP]: '+1 555 0100',
  [ContactType.WEBSITE]: 'https://example.com',
  [ContactType.LINKEDIN]: 'linkedin.com/in/…',
};
