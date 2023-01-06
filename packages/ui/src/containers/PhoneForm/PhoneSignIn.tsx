import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';

import useContinueSignInWithPassword from '@/hooks/use-continue-sign-in-with-password';
import usePasswordlessSendCode from '@/hooks/use-passwordless-send-code';
import type { ArrayElement } from '@/types';
import { UserFlow } from '@/types';

import PhoneForm from './PhoneForm';

type FormProps = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type Props = FormProps & {
  signInMethod: ArrayElement<SignIn['methods']>;
};

const PhoneSignInWithPasscode = (props: FormProps) => {
  const { onSubmit, errorMessage, clearErrorMessage } = usePasswordlessSendCode(
    UserFlow.signIn,
    SignInIdentifier.Phone
  );

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

const PhoneSignInWithPassword = (props: FormProps) => {
  const onSubmit = useContinueSignInWithPassword(SignInIdentifier.Phone);

  return <PhoneForm onSubmit={onSubmit} {...props} submitButtonText="action.sign_in" />;
};

const PhoneSignIn = ({ signInMethod, ...props }: Props) => {
  const { password, isPasswordPrimary, verificationCode } = signInMethod;

  // Continue with password
  if (password && (isPasswordPrimary || !verificationCode)) {
    return <PhoneSignInWithPassword {...props} />;
  }

  // Send passcode
  if (verificationCode) {
    return <PhoneSignInWithPasscode {...props} />;
  }

  return null;
};

export default PhoneSignIn;
