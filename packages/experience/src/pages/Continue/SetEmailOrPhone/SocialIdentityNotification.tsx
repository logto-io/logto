import { SignInIdentifier } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import type { VerificationCodeIdentifier } from '@/types';
import { registeredSocialIdentityStateGuard } from '@/types/guard';
import { maskEmail } from '@/utils/format';

import styles from './index.module.scss';

const SocialIdentityNotification = ({
  missingProfileTypes,
}: {
  readonly missingProfileTypes: VerificationCodeIdentifier[];
}) => {
  const { t } = useTranslation();
  const { state } = useLocation();

  const hasSocialIdentity = is(state, registeredSocialIdentityStateGuard);

  if (!hasSocialIdentity) {
    return null;
  }

  if (
    missingProfileTypes.includes(SignInIdentifier.Email) &&
    state.registeredSocialIdentity?.email
  ) {
    return (
      <div className={styles.description}>
        {t('description.social_identity_exist', {
          type: t('description.email'),
          value: maskEmail(state.registeredSocialIdentity.email),
        })}
      </div>
    );
  }

  if (
    missingProfileTypes.includes(SignInIdentifier.Phone) &&
    state.registeredSocialIdentity?.phone
  ) {
    return (
      <div className={styles.description}>
        {t('description.social_identity_exist', {
          type: t('description.phone_number'),
          value: state.registeredSocialIdentity.phone,
        })}
      </div>
    );
  }

  return null;
};

export default SocialIdentityNotification;
