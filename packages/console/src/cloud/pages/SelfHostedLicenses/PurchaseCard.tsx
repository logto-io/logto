import { ReservedPlanId } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import Tick from '@/assets/icons/tick.svg?react';
import { useSelfHostedLicensePrice } from '@/cloud/hooks/use-self-hosted-licenses';
import SkuName from '@/components/SkuName';
import { buildOfficialWebsiteContactPageUrl } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import TextLink from '@/ds-components/TextLink';

import styles from './PurchaseCard.module.scss';
import { formatMonthlyPrice } from './purchase-price';

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
};

function PurchaseCard({ isSubscribing, onSubscribe }: Props) {
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
      <div>
        <div className={styles.price}>
          {price
            ? t('price_per_month', { price: formatMonthlyPrice(price, i18n.language) })
            : error
              ? t('price_unavailable')
              : '…'}
        </div>
        {/* Cloud only sells a yearly price; show it per month, like the self-hosted plans page. */}
        {price && <div className={styles.priceNote}>{t('billed_annually')}</div>}
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
