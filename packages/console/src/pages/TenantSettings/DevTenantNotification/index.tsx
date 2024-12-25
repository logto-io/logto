/**
 * @file Since dev tenant does not have the subscription and billing history tabs,
 * we use this component to render the usage notification for dev tenants.
 */

import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { TenantsContext } from '@/contexts/TenantsProvider';
import InlineNotification from '@/ds-components/InlineNotification';

type Props = {
  readonly className?: string;
};

function DevTenantNotification({ className }: Props) {
  const { currentTenant } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (!currentTenant) {
    return null;
  }

  const {
    usage: { tokenUsage },
    quota: { tokenLimit },
  } = currentTenant;

  if (tokenLimit === null || tokenUsage < tokenLimit) {
    return null;
  }

  return (
    <InlineNotification severity="error" className={className}>
      {t('subscription.token_usage_notification.dev_plan_exceeded')}
    </InlineNotification>
  );
}

export default DevTenantNotification;
