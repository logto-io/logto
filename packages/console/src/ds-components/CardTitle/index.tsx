import type { AdminConsoleKey } from '@logto/phrases';
import { type ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import FeatureTag from '@/components/FeatureTag';
import { isCloud } from '@/consts/env';
import type { Props as TextLinkProps } from '@/ds-components/TextLink';

import type DangerousRaw from '../DangerousRaw';
import DynamicT from '../DynamicT';
import TextLink from '../TextLink';

import * as styles from './index.module.scss';

export type Props = {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  subtitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  size?: 'small' | 'medium' | 'large';
  learnMoreLink?: Pick<TextLinkProps, 'href' | 'targetBlank'>;
  isWordWrapEnabled?: boolean;
  className?: string;
  /**
   * If a paywall tag should be shown next to the title. The value is the plan type.
   *
   * If not provided, no paywall tag will be shown.
   */
  paywall?: Exclude<ReservedPlanId, ReservedPlanId.Free | ReservedPlanId.Development>;
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
  paywall,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.container, styles[size], className)}>
      <div className={classNames(styles.title, !isWordWrapEnabled && styles.titleEllipsis)}>
        {typeof title === 'string' ? <DynamicT forKey={title} /> : title}
        {paywall && isCloud && <FeatureTag isVisible plan={paywall} />}
      </div>
      {Boolean(subtitle ?? learnMoreLink) && (
        <div className={styles.subtitle}>
          {subtitle && (
            <span>{typeof subtitle === 'string' ? <DynamicT forKey={subtitle} /> : subtitle}</span>
          )}
          {learnMoreLink?.href && (
            <>
              {/* Use a space to keep the link and the text separate.
               * Avoid using `margin-left` since it will cause an unexpected gap when the "learn more" text is at the start of a new line
               */}{' '}
              <TextLink href={learnMoreLink.href} targetBlank={learnMoreLink.targetBlank}>
                {t('general.learn_more')}
              </TextLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CardTitle;
