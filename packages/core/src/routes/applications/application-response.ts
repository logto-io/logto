import { internalPrefix } from '@logto/schemas';

type ApplicationResponse<T extends { secret?: string }> = Omit<T, 'secret'> & { secret?: string };

/** Omit the internal application secret while preserving a legacy secret for migration. */
export const omitInternalApplicationSecret = <T extends { secret?: string }>({
  secret,
  ...application
}: T): ApplicationResponse<T> =>
  !secret || secret.startsWith(internalPrefix) ? application : { ...application, secret };
