import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPasswordForm from '@/containers/SetPassword';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';

import useSetPassword from './use-set-password';

const SetPassword = () => {
  const { setPassword } = useSetPassword();

  const { signUpSettings } = useSieMethods();

  // Password not enabled for sign-up identifiers
  if (!signUpSettings.password) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper title="description.set_password">
      <SetPasswordForm autoFocus onSubmit={setPassword} />
    </SecondaryPageWrapper>
  );
};

export default SetPassword;
