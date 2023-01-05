import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { PhoneContinue } from '@/containers/PhoneForm';

const SetPhone = () => {
  return (
    <SecondaryPageWrapper
      title="description.link_phone"
      description="description.link_phone_description"
    >
      <PhoneContinue autoFocus />
    </SecondaryPageWrapper>
  );
};

export default SetPhone;
