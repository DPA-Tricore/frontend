// How long to wait after a password manager fills the form before signing in.
// Safari fills the fields one at a time; this lets both land first.
export const AUTOFILL_SUBMIT_DELAY_MS = 300;

// Matches the backend's LoginRequestDto, so an auto sign-in never sends a
// password the server would reject outright.
export const MIN_PASSWORD_LENGTH = 6;

// A 401 from these means wrong credentials, not an expired session — so the
// API client must not clear the session and reload the login page for them.
export const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/signup'];

// The backend's code on a suspended agency's 403s (org-access.constants.ts).
export const ORG_SUSPENDED_CODE = 'ORG_SUSPENDED';

// Where a suspended agency's users land: the admin on billing, to pay;
// everyone else on the paused screen.
export const SUSPENDED_ADMIN_PATH = '/billing';
export const SUSPENDED_USER_PATH = '/suspended';
