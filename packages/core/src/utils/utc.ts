const getUtcDate = (date: Date | number) => {
  const _date = new Date(date);
  return new Date(Date.UTC(_date.getUTCFullYear(), _date.getUTCMonth(), _date.getUTCDate()));
};

/**
 * Get the start timestamp of the day in UTC, with time set to 00:00:00.000
 * @param date date
 * @returns timestamp in milliseconds
 */
export const getUtcStartOfTheDay = (date: Date | number) =>
  new Date(getUtcDate(date).setUTCHours(0, 0, 0, 0)).getTime();

/**
 * Get the end timestamp of the day in UTC, with time set to 23:59:59.999
 * @param date date
 * @returns timestamp in milliseconds
 */
export const getUtcEndOfTheDay = (date: Date | number) =>
  new Date(getUtcDate(date).setUTCHours(23, 59, 59, 999)).getTime();

/**
 * Get date string in yyyy-MM-dd format in UTC
 * @param date
 * @returns date string in yyyy-MM-dd format
 */
export const getUtcDateString = (date: Date | number) =>
  getUtcDate(date).toISOString().slice(0, 'yyyy-MM-dd'.length);
