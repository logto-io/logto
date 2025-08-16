import { ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext } from 'react';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { isProPlan } from '@/utils/subscription';

import styles from './index.module.scss';

export { default as BetaTag } from './BetaTag';

/**
 * The display tag mapping for each plan type.
 */
const planTagMap = {
  [ReservedPlanId.Free]: 'free',
  [ReservedPlanId.Pro]: 'pro',
  [ReservedPlanId.Pro202411]: 'pro',
  [ReservedPlanId.Pro202509]: 'pro',
  [ReservedPlanId.Development]: 'dev',
  [ReservedPlanId.Admin]: 'admin',
  enterprise: 'enterprise',
} as const;

/**
 * The minimum plan required to use the feature.
 * Currently we only have pro plan paywall.
 */
export type PaywallPlanId = Extract<
  ReservedPlanId,
  ReservedPlanId.Pro | ReservedPlanId.Pro202411 | ReservedPlanId.Pro202509
>;

export type Props = {
  /**
   * Whether the tag should be visible. It should be `true` if the tenant's subscription
   * plan has NO access to the feature (paywall), but it will always be visible for dev
   * tenants.
   */
  readonly isVisible: boolean;
  readonly className?: string;
  /**
   * When set to true, the feature is considered as an enterprise feature,
   * and the plan field becomes optional as enterprise features are not tied to specific plans.
   */
  readonly isEnterprise?: boolean;
} & (
  | { readonly isEnterprise: true }
  /**
   * The minimum plan required to use the feature.
   * Currently we only have pro plan paywall.
   * Set the default value to the latest pro plan id we are using.
   *
   * Note: This field is required when isEnterprise is false or undefined,
   * and optional when isEnterprise is true.
   */
  | { readonly isEnterprise?: false; readonly plan: PaywallPlanId }
);

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
  const { className, isEnterprise } = props;
  const { isDevTenant } = useContext(TenantsContext);

  const { isVisible } = props;

  // Dev tenant should always see the tag since they have access to almost all features, and it's
  // useful for developers to know which features need to be paid for in production.
  if (!isDevTenant && !isVisible) {
    return null;
  }

  if (isEnterprise) {
    return <div className={classNames(styles.tag, className)}>{planTagMap.enterprise}</div>;
  }

  return <div className={classNames(styles.tag, className)}>{planTagMap[props.plan]}</div>;
}

export default FeatureTag;

export const addOnLabels = {
  addOn: 'Add-on',
  addOnBundle: 'Add-on (bundle)',
} as const;

type CombinedAddOnAndFeatureTagProps = {
  readonly hasAddOnTag?: boolean;
  readonly className?: string;
  /** The minimum plan required to use the feature. */
  readonly paywall?: PaywallPlanId;
  /** Customize the add-on lable: currently only used by bundled add-ons  */
  readonly addOnLabel?: (typeof addOnLabels)[keyof typeof addOnLabels];
};

/**
 * When `hasAddOnTag` is `true`, the tag will be `AddOnTag` if the plan is `ReservedPlanId.Pro`
 * and dev features are enabled. Otherwise, it will be `FeatureTag` with the `paywall` prop.
 */
export function CombinedAddOnAndFeatureTag(props: CombinedAddOnAndFeatureTagProps) {
  const { hasAddOnTag, className, paywall, addOnLabel = addOnLabels.addOn } = props;
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  // We believe that the enterprise plan has already allocated sufficient resource quotas in the deal negotiation, so there is no need for upselling, nor will it trigger the add-on tag prompt.
  if (isEnterprisePlan) {
    return null;
  }

  // Show the "Add-on" tag for Pro plan.
  if (hasAddOnTag && isCloud && isProPlan(planId)) {
    return (
      <div className={classNames(styles.tag, styles.beta, styles.addOn, className)}>
        {addOnLabel}
      </div>
    );
  }

  if (paywall && isCloud) {
    return <FeatureTag isVisible plan={paywall} />;
  }

  return null;
}
