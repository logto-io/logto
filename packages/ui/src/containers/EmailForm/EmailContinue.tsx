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

const EmailContinue = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = usePasswordlessSendCode(
    UserFlow.continue,
    SignInIdentifier.Email
  );

  return (
    <EmailForm
      onSubmit={onSubmit}
      {...props}
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
      hasTerms={false}
    />
  );
};

export default EmailContinue;
