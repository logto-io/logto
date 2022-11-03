import { SignInIdentifier } from '@logto/schemas';
import { useParams } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailResetPassword } from '@/containers/EmailForm';
import { SmsResetPassword } from '@/containers/PhoneForm';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { passcodeMethodGuard } from '@/types/guard';

type Props = {
  method?: string;
};

const ForgotPassword = () => {
  const { method = '' } = useParams<Props>();
  const { forgotPassword } = useSieMethods();

  if (!is(method, passcodeMethodGuard)) {
    return <ErrorPage />;
  }

  // Forgot password with target identifier method is not supported
  if (!forgotPassword?.[method]) {
    return <ErrorPage />;
  }

  const PasswordlessForm =
    method === SignInIdentifier.Email ? EmailResetPassword : SmsResetPassword;

  return (
    <SecondaryPageWrapper
      title="description.reset_password"
      description={`description.reset_password_description_${
        method === SignInIdentifier.Email ? 'email' : 'sms'
      }`}
    >
      <PasswordlessForm
        autoFocus
        hasSwitch={
          forgotPassword[
            method === SignInIdentifier.Email ? SignInIdentifier.Sms : SignInIdentifier.Email
          ]
        }
      />
    </SecondaryPageWrapper>
  );
};

export default ForgotPassword;
