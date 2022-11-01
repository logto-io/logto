import { SignInIdentifier } from '@logto/schemas';
import { useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPassword from '@/containers/SetPassword';
import { useSieMethods } from '@/hooks/use-sie';
import { usernameGuard } from '@/types/guard';

import ErrorPage from '../ErrorPage';
import useUsernamePasswordRegister from './use-username-password-register';

const PasswordRegisterWithUsername = () => {
  const { state } = useLocation();
  const { signUpMethods } = useSieMethods();
  const { register } = useUsernamePasswordRegister();

  const hasUserName = is(state, usernameGuard);

  if (!hasUserName) {
    return <ErrorPage />;
  }

  if (!signUpMethods.includes(SignInIdentifier.Username)) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper title="description.new_password">
      <SetPassword
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onSubmit={(password) => {
          void register(state.username, password);
        }}
      />
    </SecondaryPageWrapper>
  );
};

export default PasswordRegisterWithUsername;
