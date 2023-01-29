import type { TFuncKey } from 'react-i18next';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SetPasswordForm from '@/containers/SetPassword';

import useSetPassword from './use-set-password';

type Props = {
  notification?: TFuncKey;
};

const SetPassword = (props: Props) => {
  const { setPassword } = useSetPassword();

  return (
    <SecondaryPageWrapper title="description.set_password" {...props}>
      <SetPasswordForm autoFocus onSubmit={setPassword} />
    </SecondaryPageWrapper>
  );
};

export default SetPassword;
