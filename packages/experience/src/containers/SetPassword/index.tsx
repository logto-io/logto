import { useForgotPasswordSettings } from '@/hooks/use-sie';

import SetPasswordLite from './Lite';
import SetPasswordStandard from './SetPassword';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly onSubmit: (password: string) => Promise<void>;
  readonly errorMessage?: string;
  readonly clearErrorMessage?: () => void;
  readonly maxLength?: number;
  /** Whether the password is being set in a reset password flow. */
  readonly isForgotPassword?: boolean;
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
