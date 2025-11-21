import DynamicT from '@experience/shared/components/DynamicT';
import NavBar from '@experience/shared/components/NavBar';
import PageMeta from '@experience/shared/components/PageMeta';
import type { TFuncKey } from 'i18next';
import { type ReactElement } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey;
  readonly description?: TFuncKey | ReactElement | '';
  readonly titleProps?: Record<string, unknown>;
  readonly descriptionProps?: Record<string, unknown>;
  readonly onSkip?: () => void;
  readonly onBack?: () => void;
  readonly isNavBarHidden?: boolean;
  readonly children: React.ReactNode;
};

const SecondaryPageLayout = ({
  title,
  description,
  titleProps,
  descriptionProps,
  onSkip,
  onBack,
  isNavBarHidden,
  children,
}: Props) => {
  return (
    <div className={styles.wrapper}>
      <PageMeta titleKey={title} />
      <NavBar isHidden={isNavBarHidden} onSkip={onSkip} onClose={onBack} />
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
    </div>
  );
};

export default SecondaryPageLayout;
