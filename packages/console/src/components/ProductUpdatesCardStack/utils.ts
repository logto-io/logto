export const maxVisibleCards = 3;

const gradientVariantCount = 4;

export const getCardGradientIndex = (id: string): number =>
  [...id].reduce((sum, char) => (sum + (char.codePointAt(0) ?? 0)) % gradientVariantCount, 0);

const isSameLocalDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const formatShortPublishedDate = (
  publishedDate: string,
  locale: string,
  todayLabel: string,
  now: Date = new Date()
): string => {
  const parsed = new Date(publishedDate);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  if (isSameLocalDate(parsed, now)) {
    return todayLabel;
  }

  const isSameYear = parsed.getFullYear() === now.getFullYear();

  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      ...(isSameYear ? {} : { year: 'numeric' }),
    }).format(parsed);
  } catch {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      ...(isSameYear ? {} : { year: 'numeric' }),
    }).format(parsed);
  }
};

export const formatFullPublishedDate = (publishedDate: string, locale: string): string => {
  const parsed = new Date(publishedDate);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
  } catch {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(parsed);
  }
};
