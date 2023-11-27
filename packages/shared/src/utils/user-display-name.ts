import { conditional } from '@silverhand/essentials';

import { formatToInternationalPhoneNumber } from './phone.js';

/**
 * Get user display name from multiple fields
 */
export const getUserDisplayName = ({
  name,
  username,
  primaryEmail,
  primaryPhone,
}: {
  name?: string | null;
  username?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
}): string | undefined => {
  const formattedPhoneNumber = conditional(
    primaryPhone && formatToInternationalPhoneNumber(primaryPhone)
  );

  return name ?? primaryEmail ?? formattedPhoneNumber ?? username ?? undefined;
};
