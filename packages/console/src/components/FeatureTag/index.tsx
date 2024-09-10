import { ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext } from 'react';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';

import styles from './index.module.scss';

export { default as BetaTag } from './BetaTag';

export type Props = {
  /**
   * Whether the tag should be visible. It should be `true` if the tenant's subscription
   * plan has NO access to the feature (paywall), but it will always be visible for dev
   * tenants.
   */
  readonly isVisible: boolean;
  /** The minimum plan required to use the feature. */
  readonly plan: Exclude<ReservedPlanId, ReservedPlanId.Free | ReservedPlanId.Development>;
  readonly className?: string;
};

/**
 * A tag that indicates whether a feature requires a paid plan.
 *
 * The tag will be visible if `isVisible` is `true`, which means that
 * the tenant's subscription plan has no access to the feature (paywall). However, it will always
 * be visible for dev tenants since they have access to almost all features, and it's useful for
 * developers to know which features need to be paid for in production.
 *
 * CAUTION: You should only render this component when the feature has a paywall.
 *
 * @example
 *
 * ```tsx
 * // In a production tenant, the tag will be visible when there's no access to the feature
 * <FeatureTag isVisible={noAccessToFeature} plan={ReservedPlanId.Pro} />
 *
 * // In a dev tenant, the tag will always be visible even if `isVisible` is `false`
 * <FeatureTag isVisible={false} plan={ReservedPlanId.Pro} />
 *
 * // For conditionally rendering the tag, usually in an iteration on a list which contains
 * // both free and paid features
 * {features.map((feature) => (
 *   hasPaywall(feature) &&
 *     <FeatureTag isVisible={hasAccess(feature)} plan={ReservedPlanId.Pro} />
 * ))}
 * ```
 */
function FeatureTag(props: Props) {
  const { className } = props;
  const { isDevTenant } = useContext(TenantsContext);

  const { isVisible, plan } = props;

  // Dev tenant should always see the tag since they have access to almost all features, and it's
  // useful for developers to know which features need to be paid for in production.
  if (!isDevTenant && !isVisible) {
    return null;
  }

  return <div className={classNames(styles.tag, className)}>{plan}</div>;
}

export default FeatureTag;

type CombinedAddOnAndFeatureTagProps = {
  readonly hasAddOnTag?: boolean;
  readonly className?: string;
  /** The minimum plan required to use the feature. */
  readonly paywall?: Props['plan'];
};

/**
 * When `hasAddOnTag` is `true`, the tag will be `AddOnTag` if the plan is `ReservedPlanId.Pro`
 * and dev features are enabled. Otherwise, it will be `FeatureTag` with the `paywall` prop.
 */
export function CombinedAddOnAndFeatureTag(props: CombinedAddOnAndFeatureTagProps) {
  const { hasAddOnTag, className, paywall } = props;
  const {
    currentSubscription: { planId, isAddOnAvailable, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  // We believe that the enterprise plan has already allocated sufficient resource quotas in the deal negotiation, so there is no need for upselling, nor will it trigger the add-on tag prompt.
  if (isEnterprisePlan) {
    return null;
  }

  // Show the "Add-on" tag for Pro plan when dev features enabled.
  if (hasAddOnTag && isAddOnAvailable && isCloud && planId === ReservedPlanId.Pro) {
    return (
      <div className={classNames(styles.tag, styles.beta, styles.addOn, className)}>Add-on</div>
    );
  }

  if (paywall && isCloud) {
    return <FeatureTag isVisible plan={paywall} />;
  }

  return null;
}
