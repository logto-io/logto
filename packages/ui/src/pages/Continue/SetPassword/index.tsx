import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPasswordForm from '@/containers/SetPassword';
import { passwordMinLength } from '@/utils/form';

import useSetPassword from './use-set-password';

const SetPassword = () => {
  const { setPassword } = useSetPassword();

  return (
    <SecondaryPageWrapper
      title="description.set_password"
      description="error.invalid_password"
      descriptionProps={{ min: passwordMinLength }}
    >
      <SetPasswordForm autoFocus onSubmit={setPassword} />
    </SecondaryPageWrapper>
  );
};

export default SetPassword;
