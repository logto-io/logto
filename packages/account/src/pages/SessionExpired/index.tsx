import { useLogto } from '@logto/react';

import ErrorPage from '@ac/components/ErrorPage';
import { accountCenterBasePath, setRouteRestore } from '@ac/utils/account-center-route';

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

const SessionExpired = () => {
  const { signIn } = useLogto();

  return (
    <ErrorPage
      titleKey="error.something_went_wrong"
      messageKey="error.invalid_session"
      action={{
        titleKey: 'action.sign_in',
        onClick: () => {
          setRouteRestore(window.location.pathname);
          void signIn({ redirectUri });
        },
      }}
    />
  );
};

export default SessionExpired;
