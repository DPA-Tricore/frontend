import { ContactType, type ContactResponseDto } from '@/lib/types/leads';

function asUrl(value: string, base: string): string {
  return /^https?:\/\//i.test(value) ? value : `${base}${value.replace(/^@/, '')}`;
}

/** Best-effort deep link for a contact channel. Never links do-not-contact entries. */
export function contactHref(contact: ContactResponseDto): string | null {
  if (contact.doNotContact) return null;
  const value = contact.value.trim();
  if (!value) return null;

  switch (contact.type) {
    case ContactType.EMAIL:
      return `mailto:${value}`;
    case ContactType.PHONE:
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    case ContactType.WHATSAPP:
      return `https://wa.me/${value.replace(/[^\d]/g, '')}`;
    case ContactType.TELEGRAM:
      return `https://t.me/${value.replace(/^@/, '')}`;
    case ContactType.LINKEDIN:
      return asUrl(value, 'https://linkedin.com/in/');
    case ContactType.FACEBOOK:
      return asUrl(value, 'https://facebook.com/');
    case ContactType.TWITTER:
      return asUrl(value, 'https://twitter.com/');
    case ContactType.INSTAGRAM:
      return asUrl(value, 'https://instagram.com/');
    case ContactType.WEBSITE:
      return asUrl(value, 'https://');
    case ContactType.OTHER:
    default:
      return null;
  }
}
