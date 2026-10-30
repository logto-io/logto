import DynamicT from '@experience/shared/components/DynamicT';
import NavBar from '@experience/shared/components/NavBar';
import PageMeta from '@experience/shared/components/PageMeta';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { type ReactElement, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { layoutClassNames } from '@ac/constants/layout';
import {
  clearPendingReturn,
  clearShowSuccess,
  getAccountCenterInternalRoute,
  getPendingReturn,
} from '@ac/utils/account-center-route';

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
  const navigate = useNavigate();

  // Leaving a flow opened with a `redirect` parameter returns to that URL, and the return is
  // cleared so a later flow does not complete into it.
  const leaveFlow = useCallback(() => {
    const pendingReturn = getPendingReturn();

    if (!pendingReturn) {
      window.history.back();
      return;
    }

    clearPendingReturn();
    clearShowSuccess();

    const internalRoute = getAccountCenterInternalRoute(pendingReturn);

    if (internalRoute) {
      navigate(internalRoute, { replace: true });
      return;
    }

    window.location.assign(pendingReturn);
  }, [navigate]);

  return (
    <div className={classNames(styles.wrapper, layoutClassNames.secondaryPageWrapper)}>
      <PageMeta titleKey={title} />
      <NavBar isHidden={isNavBarHidden} onSkip={onSkip} onClose={onBack ?? leaveFlow} />
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
