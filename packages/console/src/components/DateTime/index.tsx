import { type Nullable } from '@silverhand/essentials';
import { isValid } from 'date-fns';

const parseDate = (date: Nullable<string | number | Date>) => {
  if (!date) {
    return;
  }

  const parsed = new Date(date);
  return isValid(parsed) ? parsed : undefined;
};

type Props = {
  readonly children: Nullable<string | number | Date>;
};

/**
 * Safely display a date in the user's locale. If the date is invalid, it will display a dash.
 */
export function LocaleDate({ children }: Props) {
  return <span>{parseDate(children)?.toLocaleDateString() ?? '-'}</span>;
}

/**
 * Safely display a date and time in the user's locale. If the date is invalid, it will display a
 * dash.
 */
export function LocaleDateTime({ children }: Props) {
  return <span>{parseDate(children)?.toLocaleString() ?? '-'}</span>;
}
