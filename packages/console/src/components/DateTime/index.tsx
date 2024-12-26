import { type Nullable } from '@silverhand/essentials';
import { isValid, format as formatDate } from 'date-fns';

const parseDate = (date: Nullable<string | number | Date>) => {
  if (!date) {
    return;
  }

  const parsed = new Date(date);
  return isValid(parsed) ? parsed : undefined;
};

type Props = {
  readonly children: Nullable<string | number | Date>;
  readonly format?: string;
};

const defaultDateFormat = 'yyyy-MM-dd';
const defaultDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

/**
 * Safely display a date in the user's locale. If the date is invalid, it will display a dash.
 * @param format - Optional date-fns format string to customize the date format
 */
export function LocaleDate({ children, format = defaultDateFormat }: Props) {
  const date = parseDate(children);

  if (!date) {
    return <span>-</span>;
  }

  return <span>{formatDate(date, format)}</span>;
}

/**
 * Safely display a date and time. If the date is invalid, it will display a dash.
 *
 * @param format - Optional date-fns format string to customize the date and time format
 *
 * @example
 * // Default format
 * <LocaleDateTime>{new Date()}</LocaleDateTime>
 * // Custom format
 * <LocaleDateTime format="EEEE, MMMM do yyyy">
 *   {new Date()}
 * </LocaleDateTime>
 *
 * The `format` parameter accepts any valid date-fns format string. If not provided,
 * it uses the default format which includes year, month, day, hour, minute, and second.
 * For format string reference, see: https://date-fns.org/docs/format
 */
export function LocaleDateTime({ children, format = defaultDateTimeFormat }: Props) {
  const date = parseDate(children);

  if (!date) {
    return <span>-</span>;
  }

  return <span>{formatDate(date, format)}</span>;
}
