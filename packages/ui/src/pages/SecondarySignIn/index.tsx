import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import UsernameSignIn from '@/containers/UsernameSignIn';
import ErrorPage from '@/pages/ErrorPage';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { method = 'username' } = useParams<Props>();

  const signInForm = useMemo(() => {
    if (method === 'sms') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <PhonePasswordless autoFocus type="sign-in" />;
    }

    if (method === 'email') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <EmailPasswordless autoFocus type="sign-in" />;
    }

    // eslint-disable-next-line jsx-a11y/no-autofocus
    return <UsernameSignIn autoFocus />;
  }, [method]);

  if (!['email', 'sms', 'username'].includes(method)) {
    return <ErrorPage />;
  }

  return <SecondaryPageWrapper title="action.sign_in">{signInForm}</SecondaryPageWrapper>;
};

export default SecondarySignIn;
