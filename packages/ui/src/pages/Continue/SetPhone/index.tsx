import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { SmsContinue } from '@/containers/PhoneForm';

const SetPhone = () => {
  return (
    <SecondaryPageWrapper
      title="description.link_phone"
      description="description.link_phone_description"
    >
      <SmsContinue autoFocus />
    </SecondaryPageWrapper>
  );
};

export default SetPhone;
