interface NamedUser {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

/** "Sarah Lim", or the email for users who haven't set a name yet. */
export function userDisplayName(user: NamedUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email;
}
