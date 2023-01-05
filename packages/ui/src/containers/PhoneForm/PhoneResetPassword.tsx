import { SignInIdentifier } from '@logto/schemas';

import usePasswordlessSendCode from '@/hooks/use-passwordless-send-code';
import { UserFlow } from '@/types';

import PhoneForm from './PhoneForm';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasSwitch?: boolean;
};

const PhoneResetPassword = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = usePasswordlessSendCode(
    UserFlow.forgotPassword,
    SignInIdentifier.Phone
  );

  return (
    <PhoneForm
      hasTerms={false}
      onSubmit={onSubmit}
      {...props}
      submitButtonText="action.continue"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

export default PhoneResetPassword;
