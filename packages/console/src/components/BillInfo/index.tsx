import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { newPlansBlogLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';
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
        <div className={styles.price}>{`$${(cost / 100).toLocaleString()}`}</div>
        <div className={styles.description}>
          <Trans
            components={{
              a: (
                <TextLink
                  className={styles.articleLink}
                  href={newPlansBlogLink}
                  targetBlank="noopener"
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
