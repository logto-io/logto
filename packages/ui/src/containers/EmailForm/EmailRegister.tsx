import EmailForm from './EmailForm';
import useEmailRegister from './use-email-register';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

const EmailRegister = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useEmailRegister();

  return (
    <EmailForm
      onSubmit={onSubmit}
      {...props}
      submitButtonText="action.create_account"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

export default EmailRegister;
