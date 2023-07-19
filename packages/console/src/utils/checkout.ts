import { type Optional } from '@silverhand/essentials';

import { storageKeys } from '@/consts';
import { type LocalCheckoutSession, localCheckoutSessionGuard } from '@/types/subscriptions';

import { safeParseJson } from './json';

export const createLocalCheckoutSession = (session: LocalCheckoutSession) => {
  sessionStorage.setItem(storageKeys.checkoutSession, JSON.stringify(session));
};

export const getLocalCheckoutSession = (): Optional<LocalCheckoutSession> => {
  const sessionValue = sessionStorage.getItem(storageKeys.checkoutSession);
  if (!sessionValue) {
    return;
  }

  const sessionJson = safeParseJson(sessionValue);
  if (!sessionJson.success) {
    return;
  }

  const parsedSession = localCheckoutSessionGuard.safeParse(sessionJson.data);
  if (!parsedSession.success) {
    return;
  }

  return parsedSession.data;
};

export const clearLocalCheckoutSession = () => {
  sessionStorage.removeItem(storageKeys.checkoutSession);
};
