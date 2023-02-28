import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPasswordForm from '@/containers/SetPassword';

import useSetPassword from './use-set-password';

const SetPassword = () => {
  const { setPassword } = useSetPassword();

  return (
    <SecondaryPageWrapper
      title="description.set_password"
      description="error.password_min_length"
      descriptionProps={{ min: 6 }}
    >
      <SetPasswordForm autoFocus onSubmit={setPassword} />
    </SecondaryPageWrapper>
  );
};

export default SetPassword;
