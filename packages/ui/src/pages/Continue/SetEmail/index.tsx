import { SignInIdentifier } from '@logto/schemas';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailContinue } from '@/containers/EmailForm';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';

const SetEmail = () => {
  const { signUpMethods } = useSieMethods();

  if (!signUpMethods.includes(SignInIdentifier.Email)) {
    return <ErrorPage />;
  }

  const phoneSignUpAlteration = signUpMethods.includes(SignInIdentifier.Sms);

  return (
    <SecondaryPageWrapper
      title={phoneSignUpAlteration ? 'description.link_email_or_phone' : 'description.link_email'}
      description={
        phoneSignUpAlteration
          ? 'description.link_email_or_phone_description'
          : 'description.link_email_description'
      }
    >
      <EmailContinue autoFocus hasSwitch={phoneSignUpAlteration} />
    </SecondaryPageWrapper>
  );
};

export default SetEmail;
