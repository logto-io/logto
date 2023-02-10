import { SignInIdentifier } from '@logto/schemas';

import useSendVerificationCode from '@/hooks/use-send-verification-code-legacy';
import { UserFlow } from '@/types';

import PhoneForm from './PhoneForm';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

const PhoneRegister = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSendVerificationCode(
    UserFlow.register,
    SignInIdentifier.Phone
  );

  return (
    <PhoneForm
      onSubmit={onSubmit}
      {...props}
      submitButtonText="action.create_account"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

export default PhoneRegister;
