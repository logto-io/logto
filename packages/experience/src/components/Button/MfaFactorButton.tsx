import { MfaFactor } from '@logto/schemas';
import classNames from 'classnames';
import { type TFuncKey } from 'i18next';

import ArrowNext from '@/assets/icons/arrow-next.svg?react';
import FactorBackupCode from '@/assets/icons/factor-backup-code.svg?react';
import FactorEmail from '@/assets/icons/factor-email.svg?react';
import FactorPhone from '@/assets/icons/factor-phone.svg?react';
import FactorTotp from '@/assets/icons/factor-totp.svg?react';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg?react';

import DynamicT from '../DynamicT';
import FlipOnRtl from '../FlipOnRtl';

import mfaFactorButtonStyles from './MfaFactorButton.module.scss';
import styles from './index.module.scss';

export type Props = {
  readonly factor: MfaFactor;
  readonly isBinding: boolean;
  readonly isDisabled?: boolean;
  readonly maskedIdentifier?: string;
  readonly onClick?: () => void;
};

const factorIcon: Record<MfaFactor, SvgComponent> = {
  [MfaFactor.TOTP]: FactorTotp,
  [MfaFactor.WebAuthn]: FactorWebAuthn,
  [MfaFactor.BackupCode]: FactorBackupCode,
  [MfaFactor.EmailVerificationCode]: FactorEmail,
  [MfaFactor.PhoneVerificationCode]: FactorPhone,
};

const factorName: Record<MfaFactor, TFuncKey> = {
  [MfaFactor.TOTP]: 'mfa.totp',
  [MfaFactor.WebAuthn]: 'mfa.webauthn',
  [MfaFactor.BackupCode]: 'mfa.backup_code',
  [MfaFactor.EmailVerificationCode]: 'mfa.email_verification_code',
  [MfaFactor.PhoneVerificationCode]: 'mfa.phone_verification_code',
};

const factorDescription: Record<MfaFactor, TFuncKey> = {
  [MfaFactor.TOTP]: 'mfa.verify_totp_description',
  [MfaFactor.WebAuthn]: 'mfa.verify_webauthn_description',
  [MfaFactor.BackupCode]: 'mfa.verify_backup_code_description',
  [MfaFactor.EmailVerificationCode]: 'mfa.verify_email_verification_code_description',
  [MfaFactor.PhoneVerificationCode]: 'mfa.verify_phone_verification_code_description',
};

const linkFactorDescription: Record<MfaFactor, TFuncKey> = {
  [MfaFactor.TOTP]: 'mfa.link_totp_description',
  [MfaFactor.WebAuthn]: 'mfa.link_webauthn_description',
  [MfaFactor.BackupCode]: 'mfa.link_backup_code_description',
  [MfaFactor.EmailVerificationCode]: 'mfa.link_email_verification_code_description',
  [MfaFactor.PhoneVerificationCode]: 'mfa.link_phone_verification_code_description',
};

const MfaFactorButton = ({ factor, isBinding, isDisabled, maskedIdentifier, onClick }: Props) => {
  const Icon = factorIcon[factor];

  return (
    <button
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        mfaFactorButtonStyles.mfaFactorButton,
        isDisabled && mfaFactorButtonStyles.disabled
      )}
      type="button"
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
    >
      <Icon className={mfaFactorButtonStyles.icon} />
      <div className={mfaFactorButtonStyles.title}>
        <div className={mfaFactorButtonStyles.name}>
          <DynamicT forKey={factorName[factor]} />
        </div>
        <div className={mfaFactorButtonStyles.description}>
          {maskedIdentifier ? (
            <span>{maskedIdentifier}</span>
          ) : (
            <DynamicT forKey={(isBinding ? linkFactorDescription : factorDescription)[factor]} />
          )}
        </div>
      </div>
      {!isDisabled && (
        <FlipOnRtl>
          <ArrowNext className={mfaFactorButtonStyles.icon} />
        </FlipOnRtl>
      )}
    </button>
  );
};

export default MfaFactorButton;
