import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPassword from '@/containers/SetPassword';

import useResetPassword from './use-reset-password';

const ResetPassword = () => {
  const { resetPassword, errorMessage, clearErrorMessage } = useResetPassword();

  return (
    <SecondaryPageWrapper
      title="description.new_password"
      description="error.password_min_length"
      descriptionProps={{ min: 6 }}
    >
      <SetPassword
        autoFocus
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        onSubmit={resetPassword}
      />
    </SecondaryPageWrapper>
  );
};

export default ResetPassword;
