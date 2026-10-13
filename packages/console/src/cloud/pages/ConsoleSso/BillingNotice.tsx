import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';

import styles from './index.module.scss';
import { type useConnectorCreation } from './use-connector-creation';

type Props = { readonly creation: ReturnType<typeof useConnectorCreation> };

function BillingNotice({ creation }: Props) {
  const { status, billing } = creation;
  const {
    preview,
    coverage,
    funding,
    hasSubscription,
    isRecovering,
    billingError,
    isBillingReady,
  } = billing;
  return (
    <div className={styles.creationNotice}>
      {coverage.data?.used !== undefined && coverage.data.limit !== undefined && (
        <p>
          <DynamicT
            forKey={
              coverage.data.limit === null
                ? 'cloud.console_sso.included_unlimited'
                : 'cloud.console_sso.included_capacity'
            }
            interpolation={{ used: coverage.data.used, limit: coverage.data.limit }}
          />
        </p>
      )}
      {funding === 'personal' && !isRecovering && preview.data && (
        <p>
          <DynamicT
            forKey={
              hasSubscription ? 'cloud.console_sso.addition_price' : 'cloud.console_sso.first_price'
            }
          />
        </p>
      )}
      {!isBillingReady && !billingError && (
        <InlineNotification severity="info">
          <DynamicT forKey="general.loading" />
        </InlineNotification>
      )}
      {(status === 'payment_pending' || status === 'expired') && (
        <InlineNotification severity="info">
          <DynamicT
            forKey={
              status === 'payment_pending'
                ? 'cloud.console_sso.payment_pending'
                : 'cloud.console_sso.checkout_expired'
            }
          />
        </InlineNotification>
      )}
    </div>
  );
}

export default BillingNotice;
