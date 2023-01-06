import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailSignIn } from '@/containers/EmailForm';
import { PhoneSignIn } from '@/containers/PhoneForm';
import UsernameSignIn from '@/containers/UsernameSignIn';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { method = '' } = useParams<Props>();
  const { signInMethods, signInMode } = useSieMethods();
  const signInMethod = signInMethods.find(({ identifier }) => identifier === method);

  if (!signInMode || signInMode === SignInMode.Register) {
    return <ErrorPage />;
  }

  if (!signInMethod) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper title="action.sign_in">
      {signInMethod.identifier === SignInIdentifier.Phone ? (
        <PhoneSignIn autoFocus signInMethod={signInMethod} />
      ) : signInMethod.identifier === SignInIdentifier.Email ? (
        <EmailSignIn autoFocus signInMethod={signInMethod} />
      ) : (
        <UsernameSignIn autoFocus />
      )}
    </SecondaryPageWrapper>
  );
};

export default SecondarySignIn;
