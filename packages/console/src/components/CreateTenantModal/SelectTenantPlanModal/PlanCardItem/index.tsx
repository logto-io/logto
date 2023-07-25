import { maxFreeTenantLimit, adminTenantId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ArrowRight from '@/assets/icons/arrow-right.svg';
import PlanDescription from '@/components/PlanDescription';
import PlanName from '@/components/PlanName';
import PlanQuotaList from '@/components/PlanQuotaList';
import { ReservedPlanId } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import { type SubscriptionPlanQuota, type SubscriptionPlan } from '@/types/subscriptions';

import * as styles from './index.module.scss';

const featuredQuotaKeys: Array<keyof SubscriptionPlanQuota> = [
  'mauLimit',
  'machineToMachineLimit',
  'standardConnectorsLimit',
  'rolesLimit',
  'scopesPerRoleLimit',
  'auditLogsRetentionDays',
];

type Props = {
  plan: SubscriptionPlan;
  onSelect: () => void;
};

function PlanCardItem({ plan, onSelect }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.create_tenant' });
  const { tenants } = useContext(TenantsContext);
  const { stripeProducts, id: planId, name: planName, quota } = plan;

  const basePrice = useMemo(
    () => stripeProducts.find(({ type }) => type === 'flat')?.price.unitAmountDecimal ?? 0,
    [stripeProducts]
  );

  const tierPrices = useMemo(() => {
    const prices = stripeProducts
      .filter(({ type }) => type !== 'flat')
      .map(
        ({ price: { unitAmountDecimal } }) => `$${(Number(unitAmountDecimal) / 100).toFixed(3)}`
      );

    return prices.length > 0 ? prices.join(' ') : '$0.00';
  }, [stripeProducts]);

  const isFreePlan = planId === ReservedPlanId.free;

  const isFreeTenantExceeded = useMemo(
    () =>
      /** Should not block admin tenant owners from creating more than three tenants */
      !tenants.some(({ id }) => id === adminTenantId) &&
      tenants.filter(({ planId }) => planId === ReservedPlanId.free).length >= maxFreeTenantLimit,
    [tenants]
  );

  return (
    <div className={styles.container}>
      <div className={styles.planInfo}>
        <div className={styles.title}>
          <PlanName name={planName} />
        </div>
        <div className={styles.priceInfo}>
          <div className={styles.priceLabel}>{t('base_price')}</div>
          <div className={styles.price}>
            ${t('monthly_price', { value: Number(basePrice) / 100 })}
          </div>
          <div className={styles.priceLabel}>
            {t('mau_unit_price')}
            <span className={styles.unitPrices}>{tierPrices}</span>
          </div>
        </div>
        <div className={styles.description}>
          <PlanDescription planId={planId} />
        </div>
      </div>
      <div className={styles.content}>
        <PlanQuotaList
          hasIcon
          quota={quota}
          featuredQuotaKeys={featuredQuotaKeys}
          className={styles.list}
        />
        {isFreePlan && isFreeTenantExceeded && (
          <div className={classNames(styles.tip, styles.exceedFreeTenantsTip)}>
            {t('free_tenants_limit', { count: maxFreeTenantLimit })}
          </div>
        )}
        {!isFreePlan && (
          <div className={styles.tip}>
            <TextLink
              isTrailingIcon
              href="https://logto.io/pricing"
              icon={<ArrowRight className={styles.linkIcon} />}
              target="_blank"
              className={styles.link}
            >
              <DynamicT forKey="upsell.create_tenant.view_all_features" />
            </TextLink>
          </div>
        )}
        <Button
          title={
            <DangerousRaw>
              <Trans components={{ name: <PlanName name={planName} /> }}>
                {t(isFreePlan ? 'select_plan' : 'upgrade_to')}
              </Trans>
            </DangerousRaw>
          }
          disabled={isFreePlan && isFreeTenantExceeded}
          type={isFreePlan ? 'outline' : 'primary'}
          size="large"
          onClick={onSelect}
        />
      </div>
      {planId === ReservedPlanId.pro && (
        <div className={styles.mostPopularTag}>{t('most_popular')}</div>
      )}
    </div>
  );
}

export default PlanCardItem;
