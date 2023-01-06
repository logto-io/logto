import { SignInIdentifier } from '@logto/schemas';

import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { UserFlow } from '@/types';

import PhoneForm from './PhoneForm';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasSwitch?: boolean;
};

const PhoneContinue = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSendVerificationCode(
    UserFlow.continue,
    SignInIdentifier.Phone
  );

  return (
    <PhoneForm
      onSubmit={onSubmit}
      {...props}
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
      hasTerms={false}
    />
  );
};

export default PhoneContinue;
