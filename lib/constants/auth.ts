// How long to wait after a password manager fills the form before signing in.
// Safari fills the fields one at a time; this lets both land first.
export const AUTOFILL_SUBMIT_DELAY_MS = 300;

// Matches the backend's LoginRequestDto, so an auto sign-in never sends a
// password the server would reject outright.
export const MIN_PASSWORD_LENGTH = 6;
