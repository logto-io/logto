import { adminConsoleApplicationId, logtoCookieKey, logtoUiCookieGuard } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { getCookie } from 'tiny-cookie';

export const logtoCookies =
  trySafe(() => logtoUiCookieGuard.parse(getCookie(logtoCookieKey, JSON.parse))) ?? {};

export const shouldTrack = logtoCookies.appId === adminConsoleApplicationId;
