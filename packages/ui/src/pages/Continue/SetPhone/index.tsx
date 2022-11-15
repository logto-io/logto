import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { SmsContinue } from '@/containers/PhoneForm';

const SetPhone = () => {
  return (
    <SecondaryPageWrapper
      title="description.link_phone"
      description="description.link_phone_description"
      notification="description.continue_with_more_information"
    >
      <SmsContinue autoFocus />
    </SecondaryPageWrapper>
  );
};

export default SetPhone;
