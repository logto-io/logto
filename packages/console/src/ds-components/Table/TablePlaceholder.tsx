import type { AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Props as TextLinkProps } from '@/ds-components/TextLink';
import useTheme from '@/hooks/use-theme';

import DynamicT from '../DynamicT';
import TextLink from '../TextLink';

import styles from './TablePlaceholder.module.scss';

type Props = {
  readonly image: ReactNode;
  readonly imageDark: ReactNode;
  readonly title: AdminConsoleKey;
  readonly description: AdminConsoleKey;
  readonly learnMoreLink?: Pick<TextLinkProps, 'href' | 'targetBlank'>;
  readonly action: ReactNode;
};

function TablePlaceholder({ image, imageDark, title, description, learnMoreLink, action }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();

  return (
    <div className={styles.placeholder}>
      <div className={styles.image}>{theme === Theme.Light ? image : imageDark}</div>
      <div className={styles.title}>
        <DynamicT forKey={title} />
      </div>
      <div className={styles.description}>
        <DynamicT forKey={description} />
        {learnMoreLink?.href && (
          <>
            {' '}
            <TextLink href={learnMoreLink.href} targetBlank={learnMoreLink.targetBlank}>
              {t('general.learn_more')}
            </TextLink>
          </>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default TablePlaceholder;
