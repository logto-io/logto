import { type UserProfile } from '@logto/schemas';

export const formatAddress = (
  address: Exclude<UserProfile['address'], 'formatted' | undefined>
): UserProfile['address'] => {
  const { streetAddress, locality, region, postalCode, country } = address;
  const formatted = [streetAddress, locality, region, postalCode, country]
    .filter(Boolean)
    .join(', ');
  return { formatted, ...address };
};
