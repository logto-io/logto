import { maxFreeTenantLimit, adminTenantId, ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ArrowRight from '@/assets/icons/arrow-right.svg';
import PlanDescription from '@/components/PlanDescription';
import PlanName from '@/components/PlanName';
import { pricingLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import { type SubscriptionPlan } from '@/types/subscriptions';

import FeaturedPlanContent from './FeaturedPlanContent';
import * as styles from './index.module.scss';

type Props = {
  readonly plan: SubscriptionPlan;
  readonly onSelect: () => void;
  readonly buttonProps?: Partial<React.ComponentProps<typeof Button>>;
};

function PlanCardItem({ plan, onSelect, buttonProps }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.create_tenant' });
  const { tenants } = useContext(TenantsContext);
  const { stripeProducts, id: planId, name: planName } = plan;

  const basePrice = useMemo(
    () => stripeProducts.find(({ type }) => type === 'flat')?.price.unitAmountDecimal ?? 0,
    [stripeProducts]
  );

  const isFreePlan = planId === ReservedPlanId.Free;

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
          <PlanName name={planName} />
        </div>
        <div className={styles.priceInfo}>
          <div className={styles.priceLabel}>{t('base_price')}</div>
          <div className={styles.price}>
            ${t('monthly_price', { value: Number(basePrice) / 100 })}
          </div>
        </div>
        <div className={styles.description}>
          <PlanDescription planId={planId} />
        </div>
      </div>
      <div className={styles.content}>
        <FeaturedPlanContent planId={planId} />
        {isFreePlan && isFreeTenantExceeded && (
          <div className={classNames(styles.tip, styles.exceedFreeTenantsTip)}>
            {t('free_tenants_limit', { count: maxFreeTenantLimit })}
          </div>
        )}
        {!isFreePlan && (
          <div className={styles.tip}>
            <TextLink
              isTrailingIcon
              href={pricingLink}
              targetBlank="noopener"
              icon={<ArrowRight className={styles.linkIcon} />}
              className={styles.link}
            >
              <DynamicT forKey="upsell.create_tenant.view_all_features" />
            </TextLink>
          </div>
        )}
        <Button
          title={
            <DangerousRaw>
              <Trans components={{ name: <PlanName name={planName} /> }}>{t('select_plan')}</Trans>
            </DangerousRaw>
          }
          type={isFreePlan ? 'outline' : 'primary'}
          size="large"
          onClick={onSelect}
          {...buttonProps}
          disabled={(isFreePlan && isFreeTenantExceeded) || buttonProps?.disabled}
        />
      </div>
      {planId === ReservedPlanId.Pro && (
        <div className={styles.mostPopularTag}>{t('most_popular')}</div>
      )}
    </div>
  );
}

export default PlanCardItem;
