import { SignInIdentifier } from '@logto/schemas';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPassword from '@/containers/SetPassword';
import { useSieMethods } from '@/hooks/use-sie';

import ErrorPage from '../ErrorPage';
import useUsernamePasswordRegister from './use-username-password-register';

const RegisterPassword = () => {
  const { signUpMethods } = useSieMethods();
  const setPassword = useUsernamePasswordRegister();

  if (!signUpMethods.includes(SignInIdentifier.Username)) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper
      title="description.new_password"
      description="error.password_min_length"
      descriptionProps={{ min: 6 }}
    >
      <SetPassword
        autoFocus
        onSubmit={(password) => {
          void setPassword(password);
        }}
      />
    </SecondaryPageWrapper>
  );
};

export default RegisterPassword;
