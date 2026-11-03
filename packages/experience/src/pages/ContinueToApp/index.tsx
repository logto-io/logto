import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { object, string, validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';

export const continueToAppPath = 'continue-to-app';

export const continueToAppStateGuard = object({ redirectTo: string() });

/**
 * The "You're signed in / Continue" page shown before the final redirect to a native app on iOS.
 * See `useGlobalRedirectTo` for why it exists.
 */
const ContinueToApp = () => {
  const { state } = useLocation();
  const { loading, setLoading } = useContext(PageContext);
  const [, continueToAppState] = validate(state, continueToAppStateGuard);

  if (!continueToAppState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout
      isNavBarHidden
      title="description.continue_to_app_title"
      description="description.continue_to_app_description"
    >
      <Button
        title="action.continue"
        isLoading={loading}
        onClick={() => {
          setLoading(true);
          window.location.replace(continueToAppState.redirectTo);
        }}
      />
    </SecondaryPageLayout>
  );
};

export default ContinueToApp;
