import PhoneForm from './PhoneForm';
import useSmsRegister from './use-sms-register';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

const SmsRegister = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSmsRegister();

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

export default SmsRegister;
