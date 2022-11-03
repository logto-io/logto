import EmailForm from './EmailForm';
import type { MethodProps } from './use-email-sign-in';
import useEmailSignIn from './use-email-sign-in';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  signInMethod: MethodProps;
};

const EmailSignIn = ({ signInMethod, ...props }: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useEmailSignIn(signInMethod);

  return (
    <EmailForm
      onSubmit={onSubmit}
      {...props}
      submitButtonText="action.sign_in"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

export default EmailSignIn;
