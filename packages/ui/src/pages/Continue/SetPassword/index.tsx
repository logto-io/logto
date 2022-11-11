import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPasswordForm from '@/containers/SetPassword';

import useSetPassword from './use-set-password';

const SetPassword = () => {
  const { setPassword } = useSetPassword();

  return (
    <SecondaryPageWrapper title="description.set_password">
      <SetPasswordForm autoFocus onSubmit={setPassword} />
    </SecondaryPageWrapper>
  );
};

export default SetPassword;
