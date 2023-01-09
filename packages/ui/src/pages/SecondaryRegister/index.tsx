import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { useParams } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import CreateAccount from '@/containers/CreateAccount';
import { EmailRegister } from '@/containers/EmailForm';
import { PhoneRegister } from '@/containers/PhoneForm';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { SignInMethodGuard, verificationCodeMethodGuard } from '@/types/guard';

type Parameters = {
  method?: string;
};

const SecondaryRegister = () => {
  const { method = '' } = useParams<Parameters>();
  const { signUpMethods, signUpSettings, signInMode } = useSieMethods();

  if (!signInMode || signInMode === SignInMode.SignIn) {
    return <ErrorPage />;
  }

  // Validate the signUp method
  if (!is(method, SignInMethodGuard) || !signUpMethods.includes(method)) {
    return <ErrorPage />;
  }

  // Validate the verify settings
  if (is(method, verificationCodeMethodGuard) && !signUpSettings.verify) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper title="action.create_account">
      {method === SignInIdentifier.Phone ? (
        <PhoneRegister autoFocus />
      ) : method === SignInIdentifier.Email ? (
        <EmailRegister autoFocus />
      ) : (
        <CreateAccount autoFocus />
      )}
    </SecondaryPageWrapper>
  );
};

export default SecondaryRegister;
