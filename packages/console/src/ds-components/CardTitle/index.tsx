import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement } from 'react';

import { CombinedAddOnAndFeatureTag, type PaywallPlanId } from '@/components/FeatureTag';
import LearnMore, { type Props as LearnMoreProps } from '@/components/LearnMore';

import type DangerousRaw from '../DangerousRaw';
import DynamicT from '../DynamicT';

import styles from './index.module.scss';

export type Props = {
  readonly title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly subtitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly size?: 'small' | 'medium' | 'large';
  readonly learnMoreLink?: LearnMoreProps;
  readonly isWordWrapEnabled?: boolean;
  readonly className?: string;
  readonly subtitleClassName?: string;
  /**
   * If a paywall tag should be shown next to the title. The value is the plan type.
   * If not provided, no paywall tag will be shown.
   */
  readonly paywall?: PaywallPlanId;
  readonly hasAddOnTag?: boolean;
};

/**
 * Always use this component to render CardTitle, with built-in i18n support.
 */
function CardTitle({
  title,
  subtitle,
  size = 'large',
  isWordWrapEnabled = false,
  learnMoreLink,
  className,
  subtitleClassName,
  paywall,
  hasAddOnTag,
}: Props) {
  return (
    <div className={classNames(styles.container, styles[size], className)}>
      <div className={classNames(styles.title, !isWordWrapEnabled && styles.titleEllipsis)}>
        {typeof title === 'string' ? <DynamicT forKey={title} /> : title}
        <CombinedAddOnAndFeatureTag hasAddOnTag={hasAddOnTag} paywall={paywall} />
      </div>
      {Boolean(subtitle ?? learnMoreLink) && (
        <div className={classNames(styles.subtitle, subtitleClassName)}>
          {subtitle && (
            <span>{typeof subtitle === 'string' ? <DynamicT forKey={subtitle} /> : subtitle}</span>
          )}
          {learnMoreLink?.href && <LearnMore {...learnMoreLink} />}
        </div>
      )}
    </div>
  );
}

export default CardTitle;
