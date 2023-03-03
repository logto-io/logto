import type { Optional } from '@silverhand/essentials';

export const convertCookieToMap = (cookie?: string): Map<string, Optional<string>> => {
  const map = new Map<string, Optional<string>>();

  for (const element of cookie?.split(';') ?? []) {
    const [key, value] = element.trim().split('=');

    if (key) {
      map.set(key, value);
    }
  }

  return map;
};
