import { SignInIdentifier } from '@logto/schemas';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { SmsContinue } from '@/containers/PhoneForm';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';

const SetPhone = () => {
  const { signUpMethods } = useSieMethods();

  if (!signUpMethods.includes(SignInIdentifier.Sms)) {
    return <ErrorPage />;
  }

  const emailSignUpAlteration = signUpMethods.includes(SignInIdentifier.Email);

  return (
    <SecondaryPageWrapper
      title={emailSignUpAlteration ? 'description.link_email_or_phone' : 'description.link_phone'}
      description={
        emailSignUpAlteration
          ? 'description.link_email_or_phone_description'
          : 'description.link_phone_description'
      }
    >
      <SmsContinue autoFocus hasSwitch={emailSignUpAlteration} />
    </SecondaryPageWrapper>
  );
};

export default SetPhone;
