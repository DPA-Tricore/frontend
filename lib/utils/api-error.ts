import { isAxiosError } from 'axios';

/** The backend's reason for a failed request. Nest sends a string, or a list for validation errors. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return typeof message === 'string' ? message : fallback;
}
