import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { SetUsername as SetUsernameForm } from '@/containers/UsernameForm';

const SetUsername = () => (
  <SecondaryPageWrapper
    title="description.enter_username"
    description="description.enter_username_description"
    notification="description.continue_with_more_information"
  >
    <SetUsernameForm />
  </SecondaryPageWrapper>
);

export default SetUsername;
