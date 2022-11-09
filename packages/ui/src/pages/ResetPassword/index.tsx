import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPassword from '@/containers/SetPassword';

import useResetPassword from './use-reset-password';

const ResetPassword = () => {
  const { resetPassword, errorMessage, clearErrorMessage } = useResetPassword();

  return (
    <SecondaryPageWrapper title="description.new_password">
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
