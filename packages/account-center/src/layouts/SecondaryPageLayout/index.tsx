import DynamicT from '@experience/shared/components/DynamicT';
import PageMeta from '@experience/shared/components/PageMeta';
import type { TFuncKey } from 'i18next';
import { type ReactElement } from 'react';

import NavBar from '@ac/components/NavBar';

import styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey;
  readonly description?: TFuncKey | ReactElement | '';
  readonly titleProps?: Record<string, unknown>;
  readonly descriptionProps?: Record<string, unknown>;
  readonly onSkip?: () => void;
  readonly isNavBarHidden?: boolean;
  readonly children: React.ReactNode;
};

const SecondaryPageLayout = ({
  title,
  description,
  titleProps,
  descriptionProps,
  onSkip,
  isNavBarHidden,
  children,
}: Props) => {
  return (
    <div className={styles.wrapper}>
      <PageMeta titleKey={title} />
      <NavBar isHidden={isNavBarHidden} onSkip={onSkip} />
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
