import { useTranslation } from 'react-i18next';

import { type SelfHostedLicenseSummary } from '@/cloud/types/router';
import Tag from '@/ds-components/Tag';

type Props = { readonly license: SelfHostedLicenseSummary };

type LicenseStatus =
  | 'pending'
  | 'past_due'
  | 'canceling'
  | 'active'
  | NonNullable<SelfHostedLicenseSummary['keyUnavailableReason']>;

export const getLicenseStatus = (license: SelfHostedLicenseSummary): LicenseStatus => {
  // A purchase waiting for its webhook reports `expired` keys; it is activating, not expired.
  if (license.status === 'pending') {
    return 'pending';
  }
  if (license.keyUnavailableReason === 'revoked') {
    return 'revoked';
  }
  // Cloud withholds keys from a `past_due` subscription as `unpaid` while Stripe retries payment.
  if (license.subscriptionStatus === 'past_due') {
    return 'past_due';
  }
  return license.keyUnavailableReason ?? (license.cancelAtPeriodEnd ? 'canceling' : 'active');
};

/** The owner can restore keys by paying the outstanding invoice. */
export const isPaymentRequired = (license: SelfHostedLicenseSummary) => {
  const status = getLicenseStatus(license);
  return status === 'past_due' || status === 'unpaid';
};

function Status({ license }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.cloud.self_hosted_licenses',
  });
  const status = getLicenseStatus(license);

  return (
    <Tag
      type="state"
      status={status === 'active' ? 'success' : status === 'pending' ? 'info' : 'alert'}
    >
      {t(`status.${status}`)}
    </Tag>
  );
}

export default Status;
