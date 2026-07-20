import { matchesEmailBlocklistItem } from '@logto/core-kit';
import { type EmailBlocklistPolicy, type SignInExperience } from '@logto/schemas';

export type EmailBlocklistPolicyFormData = Required<EmailBlocklistPolicy>;

export const defaultBlockListPolicy: EmailBlocklistPolicyFormData = {
  blockDisposableAddresses: false,
  blockSubaddressing: false,
  customAllowlist: [],
  customBlocklist: [],
};

/**
 * Builds the complete Console form data from the email blocklist policy.
 */
export const buildEmailBlocklistPolicyFormData = ({
  emailBlocklistPolicy,
}: Pick<SignInExperience, 'emailBlocklistPolicy'>): EmailBlocklistPolicyFormData => ({
  ...defaultBlockListPolicy,
  ...emailBlocklistPolicy,
});

type EmailAllowlistWarning =
  | 'identical_entries'
  | 'blocked_exact_email'
  | 'blocked_subaddressing'
  | 'effectively_unusable';

const normalize = (value: string) => value.toLowerCase();

const isExactEmailAddress = (value: string) => !value.startsWith('@') && !value.includes('*');

const hasPlusSign = (value: string) => value.includes('+');

const isCheaplyBlockedAllowlistEntry = (
  allowlistEntry: string,
  { blockSubaddressing, customBlocklist = [] }: EmailBlocklistPolicy
) => {
  const normalizedAllowlistEntry = normalize(allowlistEntry);

  if (
    customBlocklist.some((blocklistEntry) => normalize(blocklistEntry) === normalizedAllowlistEntry)
  ) {
    return true;
  }

  if (
    isExactEmailAddress(allowlistEntry) &&
    customBlocklist.some((blocklistEntry) =>
      matchesEmailBlocklistItem(blocklistEntry, allowlistEntry)
    )
  ) {
    return true;
  }

  return blockSubaddressing === true && hasPlusSign(allowlistEntry);
};

export const getEmailAllowlistWarnings = ({
  blockSubaddressing,
  customAllowlist = [],
  customBlocklist = [],
}: EmailBlocklistPolicy): EmailAllowlistWarning[] => {
  if (customAllowlist.length === 0) {
    return [];
  }

  const warnings = new Set<EmailAllowlistWarning>();
  const normalizedBlocklist = new Set(customBlocklist.map((entry) => normalize(entry)));

  if (customAllowlist.some((entry) => normalizedBlocklist.has(normalize(entry)))) {
    warnings.add('identical_entries');
  }

  if (
    customAllowlist
      .filter((entry) => isExactEmailAddress(entry))
      .some((email) => customBlocklist.some((entry) => matchesEmailBlocklistItem(entry, email)))
  ) {
    warnings.add('blocked_exact_email');
  }

  if (blockSubaddressing && customAllowlist.some((entry) => hasPlusSign(entry))) {
    warnings.add('blocked_subaddressing');
  }

  if (
    customAllowlist.every((entry) =>
      isCheaplyBlockedAllowlistEntry(entry, { blockSubaddressing, customBlocklist })
    )
  ) {
    warnings.add('effectively_unusable');
  }

  return [...warnings];
};
