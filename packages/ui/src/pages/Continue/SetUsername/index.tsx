import { SignInIdentifier } from '@logto/schemas';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { SetUsername as SetUsernameForm } from '@/containers/UsernameForm';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';

const SetUsername = () => {
  const { signUpMethods } = useSieMethods();

  if (!signUpMethods.includes(SignInIdentifier.Username)) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper
      title="description.enter_username"
      description="description.enter_username_description"
    >
      <SetUsernameForm />
    </SecondaryPageWrapper>
  );
};

export default SetUsername;
