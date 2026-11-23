import { useLogto } from '@logto/react';
import { trySafe } from '@silverhand/essentials';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import { isCloud, productUpdatesBaseUrl } from '@/consts/env';

import useCurrentUser from './use-current-user';
import useUserPreferences from './use-user-preferences';

export type ProductUpdateItem = {
  id: string;
  title: string;
  summary: string;
  publishedDate: string;
  url: string;
};

export type FilterUnreadProductUpdatesOptions = {
  userCreatedAt: number | string;
  lastReadUpdateAt?: string;
  now?: number;
};

export type UseProductUpdatesResult = {
  readonly items: readonly ProductUpdateItem[];
  readonly dismissItem: (id: string) => void;
  readonly dismissAll: () => void;
  readonly markInteracted: () => void;
};

export const productUpdatesMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
};

export const productUpdateItemGuard = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  publishedDate: z.string().min(1),
  url: z.string().refine(isHttpUrl),
}) satisfies z.ZodType<ProductUpdateItem>;

export const productUpdatesFeedGuard = z.array(productUpdateItemGuard);

const toEpochMs = (value: number | string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    return undefined;
  }

  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const buildProductUpdatesFeedUrl = (
  language: string,
  baseUrl: string = productUpdatesBaseUrl
): string => {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  const trimmedLanguage = language.trim();

  if (trimmedLanguage === '' || trimmedLanguage === 'en') {
    return `${normalizedBaseUrl}/updates.json`;
  }

  return `${normalizedBaseUrl}/${trimmedLanguage}/updates.json`;
};

export const isProductUpdatesFeedUrl = (
  key: string,
  baseUrl: string = productUpdatesBaseUrl
): boolean => {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  return (
    normalizedBaseUrl !== '' &&
    key.startsWith(`${normalizedBaseUrl}/`) &&
    key.endsWith('/updates.json')
  );
};

export const filterUnreadProductUpdates = (
  items: readonly ProductUpdateItem[],
  { userCreatedAt, lastReadUpdateAt, now = Date.now() }: FilterUnreadProductUpdatesOptions
): ProductUpdateItem[] => {
  const userCreatedAtMs = toEpochMs(userCreatedAt);

  if (userCreatedAtMs === undefined || !Number.isFinite(now)) {
    return [];
  }

  const lastReadUpdateAtMs = toEpochMs(lastReadUpdateAt);
  const watermarkMs =
    lastReadUpdateAtMs === undefined
      ? userCreatedAtMs
      : Math.max(userCreatedAtMs, lastReadUpdateAtMs);
  const cutoffMs = now - productUpdatesMaxAgeMs;

  return items
    .map((item) => ({ item, publishedAtMs: toEpochMs(item.publishedDate) }))
    .filter(
      (entry): entry is { item: ProductUpdateItem; publishedAtMs: number } =>
        entry.publishedAtMs !== undefined &&
        entry.publishedAtMs > watermarkMs &&
        entry.publishedAtMs >= cutoffMs
    )
    .slice()
    .sort((first, second) => second.publishedAtMs - first.publishedAtMs)
    .map(({ item }) => item);
};

const fetchProductUpdatesFeed = async (url: string): Promise<readonly ProductUpdateItem[]> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    const parsed = productUpdatesFeedGuard.safeParse(payload);

    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
};

export const useProductUpdates = (): UseProductUpdatesResult => {
  const { isAuthenticated } = useLogto();
  const { user, isLoaded: isUserLoaded } = useCurrentUser();
  const {
    data: userPreferences,
    isLoaded: isPreferencesLoaded,
    update: updateUserPreferences,
  } = useUserPreferences();

  const isReady =
    isCloud && isAuthenticated && isUserLoaded && Boolean(user) && isPreferencesLoaded;
  const feedUrl = isReady
    ? buildProductUpdatesFeedUrl(userPreferences.language, productUpdatesBaseUrl)
    : null;

  const { data: feedItems } = useSWR<readonly ProductUpdateItem[]>(
    feedUrl,
    fetchProductUpdatesFeed,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  );

  const [items, setItems] = useState<readonly ProductUpdateItem[]>([]);
  const initializedUserIdRef = useRef<string>();
  const batchLatestPublishedDateRef = useRef<string>();
  const hasPersistedWatermarkRef = useRef(false);
  const updateUserPreferencesRef = useRef(updateUserPreferences);

  // eslint-disable-next-line @silverhand/fp/no-mutation -- keep latest update callback in React ref
  updateUserPreferencesRef.current = updateUserPreferences;

  useEffect(() => {
    if (!isReady || !user) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- reset session state in React ref
      initializedUserIdRef.current = undefined;
      // eslint-disable-next-line @silverhand/fp/no-mutation -- reset session watermark in React ref
      batchLatestPublishedDateRef.current = undefined;
      // eslint-disable-next-line @silverhand/fp/no-mutation -- reset persistence flag in React ref
      hasPersistedWatermarkRef.current = false;
      setItems([]);
      return;
    }

    if (feedItems === undefined || initializedUserIdRef.current === user.id) {
      return;
    }

    const initialUnread = filterUnreadProductUpdates(feedItems, {
      userCreatedAt: user.createdAt,
      lastReadUpdateAt: userPreferences.lastReadUpdateAt,
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation -- lock session batch per user in React ref
    initializedUserIdRef.current = user.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- capture batch newest publishedDate in React ref
    batchLatestPublishedDateRef.current = initialUnread[0]?.publishedDate;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- reset persistence flag for new session batch
    hasPersistedWatermarkRef.current = false;
    setItems(initialUnread);
  }, [feedItems, isReady, user, userPreferences.lastReadUpdateAt]);

  const markInteracted = useCallback(() => {
    if (hasPersistedWatermarkRef.current) {
      return;
    }

    const latestPublishedDate = batchLatestPublishedDateRef.current;

    if (!latestPublishedDate) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- ensure watermark write runs once per session
    hasPersistedWatermarkRef.current = true;
    void trySafe(async () => {
      await updateUserPreferencesRef.current({ lastReadUpdateAt: latestPublishedDate });
    });
  }, []);

  const dismissItem = useCallback(
    (id: string) => {
      markInteracted();
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [markInteracted]
  );

  const dismissAll = useCallback(() => {
    markInteracted();
    setItems([]);
  }, [markInteracted]);

  return {
    items,
    dismissItem,
    dismissAll,
    markInteracted,
  };
};
