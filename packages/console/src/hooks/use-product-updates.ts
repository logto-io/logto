import { useLogto } from '@logto/react';
import { appendPath, condString, trySafe } from '@silverhand/essentials';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import { isCloud, productUpdatesBaseUrl } from '@/consts/env';

import useCurrentUser from './use-current-user';
import useUserPreferences from './use-user-preferences';

export type ProductUpdateFeedItem = {
  id: string;
  title: string;
  summary: string;
  publishedDate: string;
};

export type ProductUpdateItem = ProductUpdateFeedItem & {
  url: string;
};

export type FilterUnreadProductUpdatesOptions = {
  userCreatedAt: number;
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

export const productUpdateFeedItemGuard = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  publishedDate: z.string().min(1),
}) satisfies z.ZodType<ProductUpdateFeedItem>;

export const productUpdatesFeedGuard = z.array(productUpdateFeedItemGuard);

export const getProductUpdatesUrl = (
  language: string,
  pathnames: readonly string[],
  baseUrl: string = productUpdatesBaseUrl
): string | undefined => {
  const trimmedLanguage = language.trim();
  const localePrefix = condString(
    trimmedLanguage && trimmedLanguage.toLowerCase() !== 'en' && encodeURIComponent(trimmedLanguage)
  );

  return trySafe(() => appendPath(new URL(baseUrl), localePrefix, ...pathnames).href);
};

export const isProductUpdatesFeedUrl = (
  key: string,
  baseUrl: string = productUpdatesBaseUrl
): boolean => {
  const parsedBaseUrl = trySafe(() => new URL(baseUrl));
  const parsedKey = trySafe(() => new URL(key));

  return Boolean(
    parsedBaseUrl &&
      parsedKey &&
      parsedKey.origin === parsedBaseUrl.origin &&
      parsedKey.pathname.endsWith('/updates.json')
  );
};

export const filterUnreadProductUpdates = <T extends Pick<ProductUpdateFeedItem, 'publishedDate'>>(
  items: readonly T[],
  { userCreatedAt, lastReadUpdateAt, now = Date.now() }: FilterUnreadProductUpdatesOptions
): T[] => {
  const lastReadAt = lastReadUpdateAt ? Date.parse(lastReadUpdateAt) : Number.NaN;
  const watermark = Number.isNaN(lastReadAt) ? userCreatedAt : Math.max(userCreatedAt, lastReadAt);
  const cutoff = now - productUpdatesMaxAgeMs;

  return items
    .filter(({ publishedDate }) => {
      const publishedAt = Date.parse(publishedDate);
      return publishedAt > watermark && publishedAt >= cutoff;
    })
    .slice()
    .sort((first, second) => Date.parse(second.publishedDate) - Date.parse(first.publishedDate));
};

const fetchProductUpdatesFeed = async (url: string): Promise<readonly ProductUpdateFeedItem[]> => {
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
    ? (getProductUpdatesUrl(userPreferences.language, ['updates.json']) ?? null)
    : null;

  const { data: feedItems } = useSWR<readonly ProductUpdateFeedItem[]>(
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
    }).flatMap((item): ProductUpdateItem[] => {
      const url = getProductUpdatesUrl(userPreferences.language, [
        'updates',
        encodeURIComponent(item.id),
      ]);

      return url ? [{ ...item, url }] : [];
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation -- lock session batch per user in React ref
    initializedUserIdRef.current = user.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- capture batch newest publishedDate in React ref
    batchLatestPublishedDateRef.current = initialUnread[0]?.publishedDate;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- reset persistence flag for new session batch
    hasPersistedWatermarkRef.current = false;
    setItems(initialUnread);
  }, [feedItems, isReady, user, userPreferences.language, userPreferences.lastReadUpdateAt]);

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
