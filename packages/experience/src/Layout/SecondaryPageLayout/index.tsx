import type { TFuncKey } from 'i18next';
import { type ReactElement } from 'react';

import NavBar from '@/components/NavBar';
import usePlatform from '@/hooks/use-platform';
import DynamicT from '@/shared/components/DynamicT';
import PageMeta from '@/shared/components/PageMeta';

import { InlineNotification } from '../../components/Notification';

import styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey;
  readonly description?: TFuncKey | ReactElement | '';
  readonly titleProps?: Record<string, unknown>;
  readonly descriptionProps?: Record<string, unknown>;
  readonly notification?: TFuncKey;
  readonly onSkip?: () => void;
  readonly isNavBarHidden?: boolean;
  readonly children: React.ReactNode;
};

const SecondaryPageLayout = ({
  title,
  description,
  titleProps,
  descriptionProps,
  notification,
  onSkip,
  isNavBarHidden,
  children,
}: Props) => {
  const { isMobile } = usePlatform();

  return (
    <div className={styles.wrapper}>
      <PageMeta titleKey={title} />
      <NavBar isHidden={isNavBarHidden} onSkip={onSkip} />
      {isMobile && notification && (
        <InlineNotification message={notification} className={styles.notification} />
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <DynamicT forKey={title} interpolation={titleProps} />
          </div>
          {description && (
            <div className={styles.description}>
              {typeof description === 'string' ? (
                <DynamicT forKey={description} interpolation={descriptionProps} />
              ) : (
                description
              )}
            </div>
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
