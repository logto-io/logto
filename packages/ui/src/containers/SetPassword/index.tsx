import { useForgotPasswordSettings } from '@/hooks/use-sie';

import SetPasswordLite from './Lite';
import SetPasswordStandard from './SetPassword';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  onSubmit: (password: string) => void;
  errorMessage?: string;
  clearErrorMessage?: () => void;
};

const SetPassword = (props: Props) => {
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();

  return isForgotPasswordEnabled ? (
    <SetPasswordLite {...props} />
  ) : (
    <SetPasswordStandard {...props} />
  );
};

export default SetPassword;
