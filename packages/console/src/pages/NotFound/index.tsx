import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import NotFoundDarkImage from '@/assets/images/not-found-dark.svg';
import NotFoundImage from '@/assets/images/not-found.svg';
import PageMeta from '@/components/PageMeta';
import Card from '@/ds-components/Card';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function NotFound({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();

  return (
    <div className={classNames(styles.container, className)}>
      {/* Don't track "not found" for the root path as it will be redirected. */}
      <PageMeta titleKey="errors.page_not_found" />
      <Card className={styles.content}>
        {theme === Theme.Light ? <NotFoundImage /> : <NotFoundDarkImage />}
        <div className={styles.message}>{t('errors.page_not_found')}</div>
      </Card>
    </div>
  );
}

export default NotFound;
