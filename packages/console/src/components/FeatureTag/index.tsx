import classNames from 'classnames';
import { useContext } from 'react';

import { TenantsContext } from '@/contexts/TenantsProvider';

import * as styles from './index.module.scss';

type BaseProps = {
  className?: string;
};

type Props =
  | (BaseProps & {
      /** What the tag is for. */
      for: 'upsell';
      /**
       * Whether the tag should be visible. It should be `true` if the tenant's subscription
       * plan has NO access to the feature (paywall), but it will always be visible for dev
       * tenants.
       */
      isVisible: boolean;
      /** The minimum plan required to use the feature. */
      plan: 'pro' | 'hobby';
    })
  | (BaseProps & {
      /** What the tag is for. */
      for: 'beta';
    });

/**
 * A tag that indicates whether a feature is in beta or requires a paid plan.
 *
 * - **For beta tags**: The tag will always be visible.
 * - **For paid plan tags**: The tag will be visible if `isVisible` is `true`, which means that
 * the tenant's subscription plan has no access to the feature (paywall). However, it will always
 * be visible for dev tenants since they have access to almost all features, and it's useful for
 * developers to know which features need to be paid for in production.
 *
 * CAUTION: You should only render this component when the feature has a paywall.
 *
 * @example
 * Use as a beta tag:
 *
 * ```tsx
 * <FeatureTag for="beta" />
 * ```
 *
 * Use as a paid plan tag:
 *
 * ```tsx
 * // In a production tenant, the tag will be visible when there's no access to the feature
 * <FeatureTag for="upsell" isVisible={noAccessToFeature} plan="pro" />
 *
 * // In a dev tenant, the tag will always be visible even if `isVisible` is `false`
 * <FeatureTag for="upsell" isVisible={false} plan="pro" />
 *
 * // Fro conditionally rendering the tag, usually in an iteration on a list which contains
 * // both free and paid features
 * {features.map((feature) => (
 *   hasPaywall(feature) &&
 *     <FeatureTag for="upsell" isVisible={hasAccess(feature)} plan="hobby" />
 * ))}
 * ```
 */
function FeatureTag(props: Props) {
  const { className, for: forType } = props;
  const { isDevTenant } = useContext(TenantsContext);

  // Beta tag should always be visible.
  if (forType === 'beta') {
    return (
      <div className={classNames(styles.tag, styles.beta, className)}>
        <span>Beta</span>
      </div>
    );
  }

  const { isVisible, plan } = props;

  // Dev tenant should always see the tag since they have access to almost all features, and it's
  // useful for developers to know which features need to be paid for in production.
  if (!isDevTenant && !isVisible) {
    return null;
  }

  return <div className={classNames(styles.tag, className)}>{plan}</div>;
}

export default FeatureTag;
