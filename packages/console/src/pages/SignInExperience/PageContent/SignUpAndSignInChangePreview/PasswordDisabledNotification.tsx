import { SignInIdentifier, type SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';

import { signUpFormDataParser } from '../utils/parser';

type Props = {
  readonly after: SignInExperience;
  readonly className?: string;
};

function PasswordDisabledNotification({ after, className }: Props) {
  const { signUp } = after;
  const { identifiers, password } = signUpFormDataParser.fromSignUp(signUp);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const shouldShowNotification = useMemo(() => {
    return (
      identifiers.length === 1 &&
      identifiers[0]?.identifier === SignInIdentifier.Username &&
      !password
    );
  }, [identifiers, password]);

  if (!shouldShowNotification) {
    return null;
  }

  return (
    <InlineNotification className={className}>
      {t('sign_in_exp.sign_up_and_sign_in.tip.password_disabled_notification')}
    </InlineNotification>
  );
}

export default PasswordDisabledNotification;
