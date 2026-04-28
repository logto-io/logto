import DynamicT from '@experience/shared/components/DynamicT';
import NavBar from '@experience/shared/components/NavBar';
import PageMeta from '@experience/shared/components/PageMeta';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { type ReactElement } from 'react';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey;
  readonly description?: TFuncKey | ReactElement | '';
  readonly titleProps?: Record<string, unknown>;
  readonly descriptionProps?: Record<string, unknown>;
  readonly notification?: ReactElement;
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
  notification,
  onSkip,
  onBack,
  isNavBarHidden,
  children,
}: Props) => {
  return (
    <div className={classNames(styles.wrapper, layoutClassNames.secondaryPageWrapper)}>
      <PageMeta titleKey={title} />
      <NavBar isHidden={isNavBarHidden} onSkip={onSkip} onClose={onBack} />
      <div className={styles.container}>
        {notification}
        <div className={styles.header}>
          <div className={classNames(styles.title, layoutClassNames.secondaryPageTitle)}>
            <DynamicT forKey={title} interpolation={titleProps} />
          </div>
          {description && (
            <div
              className={classNames(styles.description, layoutClassNames.secondaryPageDescription)}
            >
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
