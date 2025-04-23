import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import DynamicT from '@/ds-components/DynamicT';

import { CombinedAddOnAndFeatureTag, type PaywallPlanId } from '../FeatureTag';
import LearnMore, { type Props as LearnMoreProps } from '../LearnMore';

import FormCardLayout from './FormCardLayout';
import styles from './index.module.scss';

export type Props = {
  readonly title: AdminConsoleKey;
  readonly tag?: ReactNode;
  readonly description?: AdminConsoleKey;
  /**
   * Support multiple descriptions
   *
   * @remarks
   * Conflict with `description` prop, should only use one of them.
   */
  readonly descriptions?: Array<{
    key: AdminConsoleKey;
    interpolation?: Record<string, unknown>;
  }>;
  readonly descriptionInterpolation?: Record<string, unknown>;
  readonly learnMoreLink?: LearnMoreProps;
  readonly children: ReactNode;
  readonly paywall?: PaywallPlanId;
};

function FormCard({
  title,
  tag,
  description,
  descriptions,
  descriptionInterpolation,
  learnMoreLink,
  children,
  paywall,
}: Props) {
  return (
    <FormCardLayout
      introduction={
        <>
          <div className={styles.title}>
            <DynamicT forKey={title} />
            {tag}
            <CombinedAddOnAndFeatureTag paywall={paywall} />
          </div>
          {description && (
            <div className={styles.description}>
              <DynamicT forKey={description} interpolation={descriptionInterpolation} />
              {learnMoreLink?.href && <LearnMore {...learnMoreLink} />}
            </div>
          )}
          {!description &&
            descriptions?.map(({ key, interpolation }, index) => (
              <div key={key} className={classNames(styles.description, styles.descriptions)}>
                <DynamicT forKey={key} interpolation={interpolation} />
                {index === descriptions.length - 1 && learnMoreLink?.href && (
                  <LearnMore {...learnMoreLink} />
                )}
              </div>
            ))}
        </>
      }
    >
      {children}
    </FormCardLayout>
  );
}

export default FormCard;

export { default as FormCardSkeleton } from './Skeleton';
