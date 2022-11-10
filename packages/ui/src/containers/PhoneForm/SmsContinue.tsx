import { SignInIdentifier } from '@logto/schemas';

import usePasswordlessSendCode from '@/hooks/use-passwordless-send-code';
import { UserFlow } from '@/types';

import SmsForm from './PhoneForm';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasSwitch?: boolean;
};

const SmsContinue = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = usePasswordlessSendCode(
    UserFlow.continue,
    SignInIdentifier.Sms
  );

  return (
    <SmsForm
      onSubmit={onSubmit}
      {...props}
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
      hasTerms={false}
    />
  );
};

export default SmsContinue;
