import { internalPrefix } from '@logto/schemas';

type ApplicationResponse<T extends { secret?: string }> = Omit<T, 'secret'> & { secret?: string };

/**
 * Omits the internal application secret and keeps a legacy secret for migration; a read-only caller
 * gets neither.
 */
export const omitInternalApplicationSecret = <T extends { secret?: string }>(
  { secret, ...application }: T,
  { isReadOnly }: { isReadOnly?: boolean }
): ApplicationResponse<T> =>
  !secret || secret.startsWith(internalPrefix) || isReadOnly
    ? application
    : { ...application, secret };
