import { useTranslation } from 'react-i18next';

import { type SelfHostedLicenseSummary } from '@/cloud/types/self-hosted-license';
import Tag from '@/ds-components/Tag';

type Props = { readonly license: SelfHostedLicenseSummary };

function Status({ license }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.cloud.self_hosted_licenses',
  });
  const status =
    license.keyUnavailableReason ??
    (license.subscriptionStatus === 'past_due'
      ? 'past_due'
      : license.cancelAtPeriodEnd
        ? 'canceling'
        : 'active');

  return (
    <Tag type="state" status={status === 'active' ? 'success' : 'alert'}>
      {t(`status.${status}`)}
    </Tag>
  );
}

export default Status;
