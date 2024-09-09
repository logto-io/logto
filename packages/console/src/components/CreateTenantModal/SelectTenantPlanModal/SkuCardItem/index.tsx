import { maxFreeTenantLimit, adminTenantId, ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ArrowRight from '@/assets/icons/arrow-right.svg?react';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import PlanDescription from '@/components/PlanDescription';
import SkuName from '@/components/SkuName';
import { pricingLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button, { type Props as ButtonProps } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import DynamicT from '@/ds-components/DynamicT';
import FlipOnRtl from '@/ds-components/FlipOnRtl';
import TextLink from '@/ds-components/TextLink';

import FeaturedSkuContent from './FeaturedSkuContent';
import styles from './index.module.scss';

type Props = {
  readonly sku: LogtoSkuResponse;
  readonly onSelect: () => void;
  readonly buttonProps?: Partial<ButtonProps>;
};

function SkuCardItem({ sku, onSelect, buttonProps }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.create_tenant' });
  const { tenants } = useContext(TenantsContext);
  const { unitPrice: basePrice, id: skuId } = sku;

  const isFreeSku = skuId === ReservedPlanId.Free;

  const isFreeTenantExceeded = useMemo(
    () =>
      /** Should not block admin tenant owners from creating more than three tenants */
      !tenants.some(({ id }) => id === adminTenantId) &&
      tenants.filter(({ planId }) => planId === ReservedPlanId.Free).length >= maxFreeTenantLimit,
    [tenants]
  );

  return (
    <div className={styles.container}>
      <div className={styles.planInfo}>
        <div className={styles.title}>
          <SkuName skuId={skuId} />
        </div>
        <div className={styles.priceInfo}>
          <div className={styles.priceLabel}>{t('base_price')}</div>
          <div className={styles.price}>
            ${t('monthly_price', { value: (basePrice ?? 0) / 100 })}
          </div>
        </div>
        <div className={styles.description}>
          <PlanDescription skuId={skuId} planId={skuId} />
        </div>
      </div>
      <div className={styles.content}>
        <FeaturedSkuContent skuId={skuId} />
        {isFreeSku && isFreeTenantExceeded && (
          <div className={classNames(styles.tip, styles.exceedFreeTenantsTip)}>
            {t('free_tenants_limit', { count: maxFreeTenantLimit })}
          </div>
        )}
        {!isFreeSku && (
          <div className={styles.tip}>
            <TextLink
              isTrailingIcon
              href={pricingLink}
              targetBlank="noopener"
              icon={
                <FlipOnRtl>
                  <ArrowRight className={styles.linkIcon} />
                </FlipOnRtl>
              }
              className={styles.link}
            >
              <DynamicT forKey="upsell.create_tenant.view_all_features" />
            </TextLink>
          </div>
        )}
        <Button
          title={
            <DangerousRaw>
              <Trans components={{ name: <SkuName skuId={skuId} /> }}>{t('select_plan')}</Trans>
            </DangerousRaw>
          }
          type={isFreeSku ? 'outline' : 'primary'}
          size="large"
          onClick={onSelect}
          {...buttonProps}
          disabled={(isFreeSku && isFreeTenantExceeded) || buttonProps?.disabled}
        />
      </div>
      {skuId === ReservedPlanId.Pro && (
        <div className={styles.mostPopularTag}>{t('most_popular')}</div>
      )}
    </div>
  );
}

export default SkuCardItem;
