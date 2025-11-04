import { format as formatFn } from 'date-fns';

export function formatDate(date: Date | undefined, formatString = 'PPP'): string {
  if (!date) return 'Select date';
  return formatFn(date, formatString);
}
