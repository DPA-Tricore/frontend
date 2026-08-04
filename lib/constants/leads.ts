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

/** Forward pipeline stages, in order. LOST/UNRESPONSIVE are branch states, shown separately. */
export const LEAD_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION', 'CONVERTED'] as const;

export const LEAD_STAGE_DOT_COLORS: Record<(typeof LEAD_STAGES)[number], string> = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-amber-500',
  QUALIFIED: 'bg-emerald-500',
  IN_NEGOTIATION: 'bg-violet-500',
  CONVERTED: 'bg-teal-500',
};
