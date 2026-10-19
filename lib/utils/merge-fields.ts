import { MERGE_FIELD_PATTERN } from '@/lib/constants/emails';

/** Merge field names still sitting in the text as {{name}}. */
export function unfilledMergeFields(...texts: string[]): string[] {
  const names = texts.flatMap((t) => [...t.matchAll(MERGE_FIELD_PATTERN)].map((m) => m[1]));
  return [...new Set(names)];
}
