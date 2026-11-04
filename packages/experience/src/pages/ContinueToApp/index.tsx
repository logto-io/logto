import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { object, string, validate } from 'superstruct';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import CheckMark from '@/assets/icons/check-mark.svg?react';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import DynamicT from '@/shared/components/DynamicT';
import PageMeta from '@/shared/components/PageMeta';

import styles from './index.module.scss';

export const continueToAppStateGuard = object({ redirectTo: string() });

/**
 * The "Return to the app / Continue" page that holds the final sign-in redirect for the
 * `confirm_redirect_policy` sign-in parameter. See `useGlobalRedirectTo` for why it exists.
 */
const ContinueToApp = () => {
  const { state } = useLocation();
  const { loading } = useContext(PageContext);
  const redirectTo = useGlobalRedirectTo({ canConfirmRedirect: false });
  const [, continueToAppState] = validate(state, continueToAppStateGuard);

  if (!continueToAppState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  // Laid out like the device activation success page: a centered result with a single action.
  return (
    <StaticPageLayout>
      <PageMeta titleKey="description.continue_to_app_title" />
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <CheckMark className={styles.icon} />
        </div>
        <div className={styles.title}>
          <DynamicT forKey="description.continue_to_app_title" />
        </div>
        <div className={styles.description}>
          <DynamicT forKey="description.continue_to_app_description" />
        </div>
        <Button
          title="action.continue"
          isLoading={loading}
          onClick={async () => {
            await redirectTo(continueToAppState.redirectTo);
          }}
        />
      </div>
    </StaticPageLayout>
  );
};

export default ContinueToApp;
