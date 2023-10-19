/**
 * Get user display name from multiple fields
 */
export const getUserDisplayName = ({
  name,
  username,
  primaryEmail,
  primaryPhone,
}: {
  name: string | null;
  username: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
}): string => {
  return name ?? username ?? primaryEmail ?? primaryPhone ?? 'Unnamed User';
};
