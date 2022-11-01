import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailPasswordless, PhonePasswordless } from '@/containers/Passwordless';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';

type Props = {
  method?: string;
};

const ForgotPassword = () => {
  const { method = '' } = useParams<Props>();

  // TODO: @simeng LOG-4486 apply supported method guard validation. Including the form hasSwitch validation bellow
  if (!['email', 'sms'].includes(method)) {
    return <ErrorPage />;
  }

  const PasswordlessForm = method === 'email' ? EmailPasswordless : PhonePasswordless;

  return (
    <SecondaryPageWrapper
      title="description.reset_password"
      description={`description.reset_password_description_${method === 'email' ? 'email' : 'sms'}`}
    >
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <PasswordlessForm autoFocus hasSwitch type={UserFlow.forgotPassword} hasTerms={false} />
    </SecondaryPageWrapper>
  );
};

export default ForgotPassword;
