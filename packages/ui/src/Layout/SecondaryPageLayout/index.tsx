import { useTranslation } from 'react-i18next';
import type { TFuncKey } from 'react-i18next';

import NavBar from '@/components/NavBar';
import PageMeta from '@/components/PageMeta';
import usePlatform from '@/hooks/use-platform';

import { InlineNotification } from '../../components/Notification';

import * as styles from './index.module.scss';

type Props = {
  title: TFuncKey;
  description?: TFuncKey;
  titleProps?: Record<string, unknown>;
  descriptionProps?: Record<string, unknown>;
  notification?: TFuncKey;
  children: React.ReactNode;
};

const SecondaryPageLayout = ({
  title,
  description,
  titleProps,
  descriptionProps,
  notification,
  children,
}: Props) => {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();

  return (
    <div className={styles.wrapper}>
      <PageMeta titleKey={title} />
      <NavBar />
      {isMobile && notification && (
        <InlineNotification message={notification} className={styles.notification} />
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{t(title, titleProps)}</div>
          {description && (
            <div className={styles.description}>{t(description, descriptionProps)}</div>
          )}
        </div>

        {children}
      </div>
      {!isMobile && notification && (
        <InlineNotification message={notification} className={styles.notification} />
      )}
    </div>
  );
};

export default SecondaryPageLayout;
