import ArrowNext from '@experience/shared/assets/icons/arrow-next.svg?react';
import styles from '@experience/shared/components/Button/index.module.scss';
import FlipOnRtl from '@experience/shared/components/FlipOnRtl';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import PasswordIcon from '@ac/assets/icons/password.svg?react';
import { VerificationMethod } from '@ac/types';

import verificationMethodStyles from './index.module.scss';

export type Props = {
  readonly method: VerificationMethod;
  readonly onClick?: () => void;
};

const VerificationMethodButton = ({ method, onClick }: Props) => {
  const { t } = useTranslation();

  if (method !== VerificationMethod.Password) {
    return null;
  }

  return (
    <button
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        verificationMethodStyles.button
      )}
      type="button"
      onClick={onClick}
    >
      <PasswordIcon className={verificationMethodStyles.icon} />
      <div className={verificationMethodStyles.title}>
        <div className={verificationMethodStyles.name}>
          {t('account_center.verification_method.password.name')}
        </div>
        <div className={verificationMethodStyles.description}>
          {t('account_center.verification_method.password.description')}
        </div>
      </div>
      <FlipOnRtl>
        <ArrowNext className={verificationMethodStyles.icon} />
      </FlipOnRtl>
    </button>
  );
};

export default VerificationMethodButton;
