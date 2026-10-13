import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';

import styles from './index.module.scss';
import { type useConnectorCreation } from './use-connector-creation';

type Props = { readonly creation: ReturnType<typeof useConnectorCreation> };

function BillingOptions({ creation }: Props) {
  const { operation, status, isSubmitting, billing } = creation;
  const {
    preview,
    coverage,
    funding,
    hasSubscription,
    isRecovering,
    billingError,
    isBillingReady,
    setSelectedFunding,
  } = billing;
  return (
    <div className={styles.creationNotice}>
      <RadioGroup
        name="funding"
        value={funding}
        onChange={(value) => {
          if (
            !operation?.funding &&
            !isSubmitting &&
            (value === 'included' || value === 'personal')
          ) {
            setSelectedFunding(value);
          }
        }}
      >
        <Radio
          value="included"
          title="cloud.console_sso.included"
          isDisabled={isSubmitting || Boolean(operation?.funding) || !coverage.data?.isAvailable}
        />
        <Radio
          value="personal"
          title="cloud.console_sso.personal"
          isDisabled={isSubmitting || Boolean(operation?.funding)}
        />
      </RadioGroup>
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
      {billingError && (
        <InlineNotification severity="error">
          <DynamicT forKey="cloud.console_sso.billing_unavailable" />
          <Button
            title="general.retry"
            onClick={() => {
              void preview.mutate();
              void coverage.mutate();
            }}
          />
        </InlineNotification>
      )}
      {status && status !== 'open' && (
        <InlineNotification severity={status === 'error' ? 'error' : 'info'}>
          <DynamicT
            forKey={
              status === 'payment_pending'
                ? 'cloud.console_sso.payment_pending'
                : status === 'expired'
                  ? 'cloud.console_sso.checkout_expired'
                  : hasSubscription
                    ? 'cloud.console_sso.creation_retry'
                    : 'cloud.console_sso.resume_creation'
            }
          />
        </InlineNotification>
      )}
    </div>
  );
}

export default BillingOptions;
