import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import EmailSignIn from '@/containers/EmailForm/EmailSignIn';
import { PhonePasswordless } from '@/containers/Passwordless';
import UsernameSignIn from '@/containers/UsernameSignIn';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { method = 'username' } = useParams<Props>();
  const { signInMethods } = useSieMethods();

  const signInForm = useMemo(() => {
    if (method === 'sms') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <PhonePasswordless autoFocus type={UserFlow.signIn} />;
    }

    if (method === 'email') {
      const signInMethod = signInMethods.find(({ identifier }) => identifier === method);

      // eslint-disable-next-line jsx-a11y/no-autofocus
      return signInMethod && <EmailSignIn autoFocus signInMethod={signInMethod} />;
    }

    // eslint-disable-next-line jsx-a11y/no-autofocus
    return <UsernameSignIn autoFocus />;
  }, [method, signInMethods]);

  if (!['email', 'sms', 'username'].includes(method)) {
    return <ErrorPage />;
  }

  if (!signInMethods.some(({ identifier }) => identifier === method)) {
    return <ErrorPage />;
  }

  return <SecondaryPageWrapper title="action.sign_in">{signInForm}</SecondaryPageWrapper>;
};

export default SecondarySignIn;
