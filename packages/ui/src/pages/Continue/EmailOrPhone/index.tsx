import { SignInIdentifier } from '@logto/schemas';
import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailContinue } from '@/containers/EmailForm';
import { SmsContinue } from '@/containers/PhoneForm';
import ErrorPage from '@/pages/ErrorPage';

type Parameters = {
  method?: string;
};

const EmailOrPhone = () => {
  const { method = '' } = useParams<Parameters>();

  if (method === SignInIdentifier.Email) {
    return (
      <SecondaryPageWrapper
        title="description.link_email_or_phone"
        description="description.link_email_or_phone_description"
      >
        <EmailContinue autoFocus hasSwitch />
      </SecondaryPageWrapper>
    );
  }

  if (method === SignInIdentifier.Sms) {
    return (
      <SecondaryPageWrapper
        title="description.link_email_or_phone"
        description="description.link_email_or_phone_description"
      >
        <SmsContinue autoFocus hasSwitch />
      </SecondaryPageWrapper>
    );
  }

  return <ErrorPage />;
};

export default EmailOrPhone;
