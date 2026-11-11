import { ReservedPlanId } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import Tick from '@/assets/icons/tick.svg?react';
import { useSelfHostedLicensePrice } from '@/cloud/hooks/use-self-hosted-licenses';
import { formatCurrencyAmount } from '@/cloud/pages/UserSubscriptions/utils';
import SkuName from '@/components/SkuName';
import { buildOfficialWebsiteContactPageUrl } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import TextLink from '@/ds-components/TextLink';

import styles from './PurchaseCard.module.scss';

const enterpriseContactUrl = buildOfficialWebsiteContactPageUrl('self-hosted-licenses');

const featureKeys = [
  'feature_branding',
  'feature_custom_ui',
  'feature_collaboration',
  'feature_saml',
  'feature_deployment',
] as const;

type Props = {
  readonly isSubscribing: boolean;
  readonly onSubscribe: () => void;
  /** Shown when the user already holds a license and opened the card to buy another. */
  readonly onClose?: () => void;
};

function PurchaseCard({ isSubscribing, onSubscribe, onClose }: Props) {
  const { t, i18n } = useTranslation(undefined, {
    keyPrefix: 'admin_console.cloud.self_hosted_licenses.purchase',
  });
  const { data: price, error } = useSelfHostedLicensePrice();

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          <SkuName skuId={ReservedPlanId.SelfHostedPro} />
        </div>
        <div className={styles.description}>{t('description')}</div>
      </div>
      <div className={styles.price}>
        {price
          ? t('price_per_year', {
              price: formatCurrencyAmount(price.unitAmount, price.currency, i18n.language),
            })
          : error
            ? t('price_unavailable')
            : '…'}
      </div>
      <ul className={styles.features}>
        {featureKeys.map((key) => (
          <li key={key}>
            <Tick className={styles.tick} />
            {t(key)}
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button
          title="cloud.self_hosted_licenses.purchase.subscribe"
          type="primary"
          size="large"
          isLoading={isSubscribing}
          // Checkout validates the price itself; an unread price only hides the amount here.
          onClick={onSubscribe}
        />
        {onClose && (
          <Button title="general.cancel" size="large" disabled={isSubscribing} onClick={onClose} />
        )}
      </div>
      <div className={styles.enterprise}>
        <Trans
          components={{
            a: <TextLink href={enterpriseContactUrl} targetBlank="noopener" />,
          }}
        >
          {t('enterprise')}
        </Trans>
      </div>
    </Card>
  );
}

export default PurchaseCard;
