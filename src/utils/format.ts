// Dates in frontmatter (e.g. "2026-06-01") parse as UTC midnight; format in UTC
// so the displayed date never shifts a day depending on the build machine's timezone.
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
