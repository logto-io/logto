import { VerificationType } from '@logto/schemas';
import classNames from 'classnames';
import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import FactorBackupCode from '@/assets/icons/factor-backup-code.svg?react';
import FactorEmail from '@/assets/icons/factor-email.svg?react';
import FactorPhone from '@/assets/icons/factor-phone.svg?react';
import FactorTotp from '@/assets/icons/factor-totp.svg?react';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg?react';
import LockIcon from '@/assets/icons/lock.svg?react';
import ArrowNext from '@/shared/assets/icons/arrow-next.svg?react';
import styles from '@/shared/components/Button/index.module.scss';
import DynamicT from '@/shared/components/DynamicT';
import FlipOnRtl from '@/shared/components/FlipOnRtl';
import { type StepUpMethod } from '@/utils/step-up';

import factorButtonStyles from './MfaFactorButton.module.scss';

export type Props = {
  readonly method: StepUpMethod;
  /** The masked email or phone the code goes to; shown as the subtitle of a code method. */
  readonly maskedIdentifier?: string;
  readonly onClick?: () => void;
};

const methodIcon: Record<StepUpMethod, SvgComponent> = {
  [VerificationType.Password]: LockIcon,
  [VerificationType.EmailVerificationCode]: FactorEmail,
  [VerificationType.PhoneVerificationCode]: FactorPhone,
  [VerificationType.TOTP]: FactorTotp,
  [VerificationType.WebAuthn]: FactorWebAuthn,
  [VerificationType.BackupCode]: FactorBackupCode,
  [VerificationType.MfaEmailVerificationCode]: FactorEmail,
  [VerificationType.MfaPhoneVerificationCode]: FactorPhone,
};

const methodName: Record<StepUpMethod, TFuncKey> = {
  [VerificationType.Password]: 'step_up.password',
  [VerificationType.EmailVerificationCode]: 'mfa.email_verification_code',
  [VerificationType.PhoneVerificationCode]: 'mfa.phone_verification_code',
  [VerificationType.TOTP]: 'mfa.totp',
  [VerificationType.WebAuthn]: 'mfa.webauthn',
  [VerificationType.BackupCode]: 'mfa.backup_code',
  [VerificationType.MfaEmailVerificationCode]: 'mfa.email_verification_code',
  [VerificationType.MfaPhoneVerificationCode]: 'mfa.phone_verification_code',
};

const methodDescription: Record<StepUpMethod, TFuncKey> = {
  [VerificationType.Password]: 'step_up.password_description',
  [VerificationType.EmailVerificationCode]: 'mfa.verify_email_verification_code_description',
  [VerificationType.PhoneVerificationCode]: 'mfa.verify_phone_verification_code_description',
  [VerificationType.TOTP]: 'mfa.verify_totp_description',
  [VerificationType.WebAuthn]: 'mfa.verify_webauthn_description',
  [VerificationType.BackupCode]: 'mfa.verify_backup_code_description',
  [VerificationType.MfaEmailVerificationCode]: 'mfa.verify_email_verification_code_description',
  [VerificationType.MfaPhoneVerificationCode]: 'mfa.verify_phone_verification_code_description',
};

const emailCodeMethods: ReadonlySet<StepUpMethod> = new Set([
  VerificationType.EmailVerificationCode,
  VerificationType.MfaEmailVerificationCode,
]);

/**
 * One entry of the step-up method list, modeled on `MfaFactorButton` (whose styles it shares) and
 * keyed by the verification types Core can offer for step-up.
 */
const StepUpMethodButton = ({ method, maskedIdentifier, onClick }: Props) => {
  const { t } = useTranslation();
  const Icon = methodIcon[method];

  return (
    <button
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        factorButtonStyles.mfaFactorButton
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className={factorButtonStyles.icon} />
      <div className={factorButtonStyles.title}>
        <div className={factorButtonStyles.name}>
          <DynamicT forKey={methodName[method]} />
        </div>
        <div className={factorButtonStyles.description}>
          {maskedIdentifier ? (
            <span>
              {t(emailCodeMethods.has(method) ? 'mfa.send_to_email' : 'mfa.send_to_phone', {
                identifier: maskedIdentifier,
              })}
            </span>
          ) : (
            <DynamicT forKey={methodDescription[method]} />
          )}
        </div>
      </div>
      <FlipOnRtl>
        <ArrowNext className={factorButtonStyles.icon} />
      </FlipOnRtl>
    </button>
  );
};

export default StepUpMethodButton;
