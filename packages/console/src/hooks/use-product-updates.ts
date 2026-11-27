import { useLogto } from '@logto/react';
import { appendPath, condString, trySafe } from '@silverhand/essentials';
import { useCallback, useMemo, useState } from 'react';
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

type SessionState = {
  readonly userId: string;
  readonly initialLastReadUpdateAt?: string;
  readonly dismissedIds: readonly string[];
  readonly isDismissedAll: boolean;
  readonly hasPersistedWatermark: boolean;
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

  const [session, setSession] = useState<SessionState>();
  const activeSession = user && session?.userId === user.id ? session : undefined;
  const effectiveLastReadUpdateAt = activeSession
    ? activeSession.initialLastReadUpdateAt
    : userPreferences.lastReadUpdateAt;

  const initialUnread = useMemo(() => {
    if (!isReady || !user || !feedItems) {
      return [];
    }

    return filterUnreadProductUpdates(feedItems, {
      userCreatedAt: user.createdAt,
      lastReadUpdateAt: effectiveLastReadUpdateAt,
    }).flatMap((item): ProductUpdateItem[] => {
      const url = getProductUpdatesUrl(userPreferences.language, [
        'updates',
        encodeURIComponent(item.id),
      ]);

      return url ? [{ ...item, url }] : [];
    });
  }, [effectiveLastReadUpdateAt, feedItems, isReady, user, userPreferences.language]);

  const items = useMemo(() => {
    if (!activeSession) {
      return initialUnread;
    }

    if (activeSession.isDismissedAll) {
      return [];
    }

    return initialUnread.filter(({ id }) => !activeSession.dismissedIds.includes(id));
  }, [activeSession, initialUnread]);

  const applySessionInteraction = useCallback(
    (updater: (current: SessionState) => SessionState) => {
      if (!user) {
        return;
      }

      const latestPublishedDate = initialUnread[0]?.publishedDate;
      const shouldPersist = Boolean(latestPublishedDate && !activeSession?.hasPersistedWatermark);

      setSession((current) => {
        const base: SessionState =
          current?.userId === user.id
            ? current
            : {
                userId: user.id,
                initialLastReadUpdateAt: userPreferences.lastReadUpdateAt,
                dismissedIds: [],
                isDismissedAll: false,
                hasPersistedWatermark: false,
              };

        return updater({
          ...base,
          hasPersistedWatermark: base.hasPersistedWatermark || shouldPersist,
        });
      });

      if (shouldPersist && latestPublishedDate) {
        void trySafe(async () => {
          await updateUserPreferences({ lastReadUpdateAt: latestPublishedDate });
        });
      }
    },
    [
      activeSession?.hasPersistedWatermark,
      initialUnread,
      updateUserPreferences,
      user,
      userPreferences.lastReadUpdateAt,
    ]
  );

  const markInteracted = useCallback(() => {
    applySessionInteraction((current) => current);
  }, [applySessionInteraction]);

  const dismissItem = useCallback(
    (id: string) => {
      applySessionInteraction((current) => ({
        ...current,
        dismissedIds: current.dismissedIds.includes(id)
          ? current.dismissedIds
          : [...current.dismissedIds, id],
      }));
    },
    [applySessionInteraction]
  );

  const dismissAll = useCallback(() => {
    applySessionInteraction((current) => ({
      ...current,
      isDismissedAll: true,
    }));
  }, [applySessionInteraction]);

  return {
    items,
    dismissItem,
    dismissAll,
    markInteracted,
  };
};
