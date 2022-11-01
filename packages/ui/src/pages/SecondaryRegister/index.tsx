import { SignInIdentifier } from '@logto/schemas';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import CreateAccount from '@/containers/CreateAccount';
import { EmailRegister } from '@/containers/EmailForm';
import { SmsRegister } from '@/containers/PhoneForm';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { SignInMethodGuard, passcodeMethodGuard } from '@/types/guard';

type Parameters = {
  method?: string;
};

const SecondaryRegister = () => {
  const { method = '' } = useParams<Parameters>();
  const { signUpMethods, signUpSettings } = useSieMethods();

  const registerForm = useMemo(() => {
    if (method === SignInIdentifier.Sms) {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <SmsRegister autoFocus />;
    }

    if (method === SignInIdentifier.Email) {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <EmailRegister autoFocus />;
    }

    if (method === SignInIdentifier.Username) {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <CreateAccount autoFocus />;
    }
  }, [method]);

  // Validate the signUp method
  if (!is(method, SignInMethodGuard) || !signUpMethods.includes(method)) {
    return <ErrorPage />;
  }

  // Validate the verify settings
  if (is(method, passcodeMethodGuard) && !signUpSettings.verify) {
    return <ErrorPage />;
  }

  return <SecondaryPageWrapper title="action.create_account">{registerForm}</SecondaryPageWrapper>;
};

export default SecondaryRegister;
