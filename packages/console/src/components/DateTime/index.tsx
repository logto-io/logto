import { type Nullable } from '@silverhand/essentials';
import { isValid } from 'date-fns';

const parseDate = (date: Nullable<string | number | Date>) => {
  if (!date) {
    return;
  }

  const parsed = new Date(date);
  return isValid(parsed) ? parsed : undefined;
};

type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

type Props = {
  readonly children: Nullable<string | number | Date>;
  readonly format?: Partial<DateTimeFormatOptions>;
};

const defaultDateFormat: DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

const defaultDateTimeFormat: DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
};

/**
 * Safely display a date in the user's locale. If the date is invalid, it will display a dash.
 * @param format - Optional Intl.DateTimeFormatOptions to customize the date format
 */
export function LocaleDate({ children, format = {} }: Props) {
  const date = parseDate(children);

  if (!date) {
    return <span>-</span>;
  }

  return (
    <span>
      {new Intl.DateTimeFormat(undefined, { ...defaultDateFormat, ...format }).format(date)}
    </span>
  );
}

/**
 * Safely display a date and time in the user's locale. If the date is invalid, it will display a dash.
 *
 * @param format - Optional Intl.DateTimeFormatOptions to customize the date and time format
 *
 * @example
 * // Default format
 * <LocaleDateTime>{new Date()}</LocaleDateTime>
 * // Custom format
 * <LocaleDateTime format={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}>
 *   {new Date()}
 * </LocaleDateTime>
 *
 * The `format` parameter allows you to customize the output. It accepts any valid
 * Intl.DateTimeFormatOptions. If not provided, it uses the default format which includes
 * year, month, day, hour, minute, and second in the user's locale.
 */
export function LocaleDateTime({ children, format = {} }: Props) {
  const date = parseDate(children);

  if (!date) {
    return <span>-</span>;
  }

  return (
    <span>
      {new Intl.DateTimeFormat(undefined, { ...defaultDateTimeFormat, ...format }).format(date)}
    </span>
  );
}
