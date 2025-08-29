import { ForgotPasswordMethod } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import DiffSegment from './DiffSegment';
import styles from './index.module.scss';

type Props = {
  readonly before: ForgotPasswordMethod[] | undefined;
  readonly after: ForgotPasswordMethod[] | undefined;
  readonly isAfter?: boolean;
};

function ForgotPasswordMethodsDiffSection({ before, after, isAfter = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const sortedBeforeMethods = (before ?? []).slice().sort();
  const sortedAfterMethods = (after ?? []).slice().sort();

  const displayMethods = isAfter ? sortedAfterMethods : sortedBeforeMethods;

  const hasChanged = (method: ForgotPasswordMethod) =>
    !((before ?? []).includes(method) && (after ?? []).includes(method));

  const getMethodLabel = (method: ForgotPasswordMethod) => {
    switch (method) {
      case ForgotPasswordMethod.EmailVerificationCode: {
        return t('sign_in_exp.sign_up_and_sign_in.sign_in.email_verification_code');
      }
      case ForgotPasswordMethod.PhoneVerificationCode: {
        return t('sign_in_exp.sign_up_and_sign_in.sign_in.phone_verification_code');
      }
    }
  };

  if (displayMethods.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={styles.title}>
        {t('sign_in_exp.sign_up_and_sign_in.sign_in.forgot_password')}
      </div>
      <ul className={styles.list}>
        {displayMethods.map((method) => (
          <li key={method}>
            <DiffSegment hasChanged={hasChanged(method)} isAfter={isAfter}>
              {getMethodLabel(method)}
            </DiffSegment>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ForgotPasswordMethodsDiffSection;
