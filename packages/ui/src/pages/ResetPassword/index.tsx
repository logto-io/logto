import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SetPassword from '@/containers/SetPassword';
import { passwordMinLength } from '@/utils/form';

import useResetPassword from './use-reset-password';

const ResetPassword = () => {
  const { resetPassword, errorMessage, clearErrorMessage } = useResetPassword();

  return (
    <SecondaryPageLayout
      title="description.new_password"
      description="error.invalid_password"
      descriptionProps={{ min: passwordMinLength }}
    >
      <SetPassword
        autoFocus
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        onSubmit={resetPassword}
      />
    </SecondaryPageLayout>
  );
};

export default ResetPassword;
