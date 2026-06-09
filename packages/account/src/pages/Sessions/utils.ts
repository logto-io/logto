import {
  type GetAccountUserSessionsResponse,
  type GetUserApplicationGrantsResponse,
} from '@logto/schemas';
import {
  normalizeUserApplicationGrantGroups,
  type UserApplicationGrantGroup,
} from '@logto/shared/universal';
import { format } from 'date-fns';

import { getDateFnsLocale } from '@ac/utils/date';

export type AccountSession = GetAccountUserSessionsResponse['sessions'][number];
export type AccountGrant = GetUserApplicationGrantsResponse['grants'][number];
export { getSessionDisplayInfo } from '@logto/shared/universal';

/**
 * Format a timestamp to a locale-aware human-readable string.
 * Handles both seconds and milliseconds (if < 1 trillion, treated as seconds).
 */
export const formatTimestamp = (value?: number, language?: string) => {
  if (!value) {
    return '-';
  }

  const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;

  return format(new Date(timestamp), 'PPp', { locale: getDateFnsLocale(language ?? 'en') });
};

export type GrantedAppRow = UserApplicationGrantGroup;

export const normalizeGrantRows = (grants: AccountGrant[]): GrantedAppRow[] =>
  normalizeUserApplicationGrantGroups(grants);
