import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SetPasswordForm from '@/containers/SetPassword';
import { passwordMinLength } from '@/utils/form';

import useSetPassword from './use-set-password';

const SetPassword = () => {
  const { setPassword } = useSetPassword();

  return (
    <SecondaryPageLayout
      title="description.set_password"
      description="error.invalid_password"
      descriptionProps={{ min: passwordMinLength }}
    >
      <SetPasswordForm autoFocus onSubmit={setPassword} />
    </SecondaryPageLayout>
  );
};

export default SetPassword;
