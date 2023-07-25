import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';
import useSubscribe from '@/hooks/use-subscribe';

import * as styles from './index.module.scss';

type Props = {
  cost: number;
  isManagePaymentVisible?: boolean;
};

function BillInfo({ cost, isManagePaymentVisible }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { visitManagePaymentPage } = useSubscribe();
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.billInfo}>
        <div className={styles.price}>
          <span>{`$${(cost / 100).toLocaleString()}`}</span>
          {cost > 0 && (
            <ToggleTip content={<DynamicT forKey="subscription.next_bill_tip" />}>
              <IconButton size="small">
                <Tip />
              </IconButton>
            </ToggleTip>
          )}
        </div>
        <div className={styles.description}>
          <Trans
            components={{
              a: (
                <TextLink
                  href="https://blog.logto.io/logto-pricing-model"
                  target="_blank"
                  className={styles.articleLink}
                />
              ),
            }}
          >
            {t('subscription.next_bill_hint')}
          </Trans>
        </div>
      </div>
      {isManagePaymentVisible && (
        <Button
          title="subscription.manage_payment"
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await visitManagePaymentPage(currentTenantId);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}

export default BillInfo;
