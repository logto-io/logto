import PhoneForm from './PhoneForm';
import type { MethodProps } from './use-sms-sign-in';
import useSmsSignIn from './use-sms-sign-in';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  signInMethod: MethodProps;
};

const SmsSignIn = ({ signInMethod, ...props }: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSmsSignIn(signInMethod);

  return (
    <PhoneForm
      onSubmit={onSubmit}
      {...props}
      submitButtonText="action.sign_in"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

export default SmsSignIn;
