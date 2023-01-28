import type { TFuncKey } from 'react-i18next';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { EmailContinue } from '@/containers/EmailForm';

type Props = {
  notification?: TFuncKey;
};

const SetEmail = (props: Props) => (
  <SecondaryPageWrapper
    title="description.link_email"
    description="description.link_email_description"
    {...props}
  >
    <EmailContinue autoFocus />
  </SecondaryPageWrapper>
);

export default SetEmail;
