import { SignInIdentifier } from '@logto/schemas';

import usePasswordlessSendCode from '@/hooks/use-passwordless-send-code';
import { UserFlow } from '@/types';

import EmailForm from './EmailForm';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasSwitch?: boolean;
};

const EmailResetPassword = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = usePasswordlessSendCode(
    UserFlow.forgotPassword,
    SignInIdentifier.Email
  );

  return (
    <EmailForm
      onSubmit={onSubmit}
      {...props}
      hasTerms={false}
      submitButtonText="action.continue"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

export default EmailResetPassword;
