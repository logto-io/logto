import type { TFuncKey } from 'react-i18next';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { PhoneContinue } from '@/containers/PhoneForm';

type Props = {
  notification?: TFuncKey;
};

const SetPhone = (props: Props) => {
  return (
    <SecondaryPageWrapper
      title="description.link_phone"
      description="description.link_phone_description"
      {...props}
    >
      <PhoneContinue autoFocus />
    </SecondaryPageWrapper>
  );
};

export default SetPhone;
