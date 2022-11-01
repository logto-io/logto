import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import CreateAccount from '@/containers/CreateAccount';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';

type Parameters = {
  method?: string;
};

const SecondaryRegister = () => {
  const { method = 'username' } = useParams<Parameters>();

  const registerForm = useMemo(() => {
    if (method === 'sms') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <PhonePasswordless autoFocus type={UserFlow.register} />;
    }

    if (method === 'email') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <EmailPasswordless autoFocus type={UserFlow.register} />;
    }

    // eslint-disable-next-line jsx-a11y/no-autofocus
    return <CreateAccount autoFocus />;
  }, [method]);

  if (!['email', 'sms', 'username'].includes(method)) {
    return <ErrorPage />;
  }

  return <SecondaryPageWrapper title="action.create_account">{registerForm}</SecondaryPageWrapper>;
};

export default SecondaryRegister;
