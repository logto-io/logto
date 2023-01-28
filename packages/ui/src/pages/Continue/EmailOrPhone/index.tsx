import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useParams, useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailContinue } from '@/containers/EmailForm';
import { PhoneContinue } from '@/containers/PhoneForm';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { continueFlowStateGuard } from '@/types/guard';

type Parameters = {
  method?: string;
};

const EmailOrPhone = () => {
  const { method = '' } = useParams<Parameters>();
  const { state } = useLocation();

  const [_, data] = validate(state, continueFlowStateGuard);
  const notification = conditional(
    data?.flow === UserFlow.signIn && 'description.continue_with_more_information'
  );

  if (method === SignInIdentifier.Email) {
    return (
      <SecondaryPageWrapper
        title="description.link_email_or_phone"
        description="description.link_email_or_phone_description"
        notification={notification}
      >
        <EmailContinue autoFocus hasSwitch />
      </SecondaryPageWrapper>
    );
  }

  if (method === SignInIdentifier.Phone) {
    return (
      <SecondaryPageWrapper
        title="description.link_email_or_phone"
        description="description.link_email_or_phone_description"
        notification={notification}
      >
        <PhoneContinue autoFocus hasSwitch />
      </SecondaryPageWrapper>
    );
  }

  return <ErrorPage />;
};

export default EmailOrPhone;
