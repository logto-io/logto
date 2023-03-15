import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type DangerousRaw from '../DangerousRaw';
import TextLink from '../TextLink';
import * as styles from './index.module.scss';

export type Props = {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  subtitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  size?: 'small' | 'medium' | 'large';
  learnMoreLink?: string;
  learnMoreLinkText?: AdminConsoleKey;
  isWordWrapEnabled?: boolean;
  className?: string;
};

/**
 * Always use this component to render CardTitle, with built-in i18n support.
 */
const CardTitle = ({
  title,
  subtitle,
  size = 'large',
  isWordWrapEnabled = false,
  learnMoreLink,
  learnMoreLinkText = 'general.learn_more',
  className,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.container, styles[size], className)}>
      <div className={classNames(styles.title, !isWordWrapEnabled && styles.titleEllipsis)}>
        {typeof title === 'string' ? t(title) : title}
      </div>
      {Boolean(subtitle ?? learnMoreLink) && (
        <div className={styles.subtitle}>
          {subtitle && <span>{typeof subtitle === 'string' ? t(subtitle) : subtitle}</span>}
          {learnMoreLink && (
            <TextLink href={learnMoreLink} target="_blank" className={styles.learnMore}>
              {t(learnMoreLinkText)}
            </TextLink>
          )}
        </div>
      )}
    </div>
  );
};

export default CardTitle;
