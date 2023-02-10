import { SignInIdentifier } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import useSendVerificationCode from '@/hooks/use-send-verification-code-legacy';
import { UserFlow } from '@/types';
import { registeredSocialIdentityStateGuard } from '@/types/guard';

import PhoneForm from './PhoneForm';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasSwitch?: boolean;
};

const PhoneContinue = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSendVerificationCode(
    UserFlow.continue,
    SignInIdentifier.Phone
  );

  const { t } = useTranslation();

  const { state } = useLocation();
  const hasSocialIdentity = is(state, registeredSocialIdentityStateGuard);

  return (
    <>
      <PhoneForm
        onSubmit={onSubmit}
        {...props}
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        hasTerms={false}
      />
      {hasSocialIdentity && state.registeredSocialIdentity?.email && (
        <div className={styles.description}>
          {t('description.social_identity_exist', {
            type: t('description.phone_number'),
            value: state.registeredSocialIdentity.email,
          })}
        </div>
      )}
    </>
  );
};

export default PhoneContinue;
