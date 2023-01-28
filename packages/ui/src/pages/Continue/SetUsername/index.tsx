import type { TFuncKey } from 'react-i18next';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { SetUsername as SetUsernameForm } from '@/containers/UsernameForm';

type Props = {
  notification?: TFuncKey;
};

const SetUsername = (props: Props) => (
  <SecondaryPageWrapper
    title="description.enter_username"
    description="description.enter_username_description"
    {...props}
  >
    <SetUsernameForm />
  </SecondaryPageWrapper>
);

export default SetUsername;
