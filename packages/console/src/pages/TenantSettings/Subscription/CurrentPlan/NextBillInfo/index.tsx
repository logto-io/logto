import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';

import * as styles from './index.module.scss';

type Props = {
  cost: number;
};

function NextBillInfo({ cost }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.billInfo}>
        <div className={styles.price}>
          <span>{`$${cost.toLocaleString()}`}</span>
          {}
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
      {cost > 0 && (
        <Button
          title="subscription.manage_payment"
          onClick={() => {
            // Todo @xiaoyijun Management payment
          }}
        />
      )}
    </div>
  );
}

export default NextBillInfo;
