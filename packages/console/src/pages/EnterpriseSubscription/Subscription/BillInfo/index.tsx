import { useState, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { addOnPricingExplanationLink } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type Props = {
  readonly cost: number;
  readonly logtoEnterpriseId: string;
};

function BillInfo({ cost, logtoEnterpriseId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isLoading, setIsLoading] = useState(false);

  const cloudApi = useCloudApi({ hideErrorToast: true });

  const visitCustomerPortal = useCallback(
    async (logtoEnterpriseId: string) => {
      try {
        const currentUrl = window.location.href;
        const { redirectUri } = await cloudApi.post(
          '/api/me/logto-enterprises/:id/stripe-customer-portal',
          {
            params: {
              id: logtoEnterpriseId,
            },
            body: {
              callbackUrl: currentUrl,
            },
          }
        );

        // eslint-disable-next-line @silverhand/fp/no-mutation
        window.location.href = redirectUri;
      } catch (error: unknown) {
        void toastResponseError(error);
      }
    },
    [cloudApi]
  );

  return (
    <div className={styles.container}>
      <div className={styles.billInfo}>
        <div className={styles.price}>
          <span>{`$${(cost / 100).toLocaleString()}`}</span>
          <ToggleTip content={<DynamicT forKey="subscription.next_bill_tip" />}>
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        </div>
        <div className={styles.description}>
          <Trans
            components={{
              a: (
                <TextLink
                  className={styles.articleLink}
                  href={addOnPricingExplanationLink}
                  targetBlank="noopener"
                />
              ),
            }}
          >
            {t('subscription.next_bill_hint')}
          </Trans>
        </div>
      </div>
      <Button
        title="subscription.manage_payment"
        isLoading={isLoading}
        onClick={async () => {
          setIsLoading(true);
          await visitCustomerPortal(logtoEnterpriseId);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export default BillInfo;
