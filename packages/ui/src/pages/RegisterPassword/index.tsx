import { SignInIdentifier } from '@logto/schemas';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SetPassword from '@/containers/SetPassword';
import { useSieMethods } from '@/hooks/use-sie';
import { passwordMinLength } from '@/utils/form';

import ErrorPage from '../ErrorPage';

import useUsernamePasswordRegister from './use-username-password-register';

const RegisterPassword = () => {
  const { signUpMethods } = useSieMethods();
  const setPassword = useUsernamePasswordRegister();

  if (!signUpMethods.includes(SignInIdentifier.Username)) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageLayout
      title="description.new_password"
      description="error.invalid_password"
      descriptionProps={{ min: passwordMinLength }}
    >
      <SetPassword
        autoFocus
        onSubmit={(password) => {
          void setPassword(password);
        }}
      />
    </SecondaryPageLayout>
  );
};

export default RegisterPassword;
