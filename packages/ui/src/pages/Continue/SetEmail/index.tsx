import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailContinue } from '@/containers/EmailForm';

const SetEmail = () => (
  <SecondaryPageWrapper
    title="description.link_email"
    description="description.link_email_description"
  >
    <EmailContinue autoFocus />
  </SecondaryPageWrapper>
);

export default SetEmail;
