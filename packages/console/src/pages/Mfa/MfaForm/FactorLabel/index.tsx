import { type AdminConsoleKey } from '@logto/phrases';
import { MfaFactor } from '@logto/schemas';

import { BetaTag } from '@/components/FeatureTag';
import MfaFactorTitle from '@/components/MfaFactorTitle';
import DynamicT from '@/ds-components/DynamicT';

import WebAuthnTipContent from './WebAuthnTipContent';
import styles from './index.module.scss';

type Props = {
  readonly type: MfaFactor;
};

const factorDescriptionLabel: Record<MfaFactor, AdminConsoleKey> = {
  [MfaFactor.TOTP]: 'mfa.otp_description',
  [MfaFactor.WebAuthn]: 'mfa.webauthn_description',
  [MfaFactor.BackupCode]: 'mfa.backup_code_description',
  [MfaFactor.EmailVerificationCode]: 'mfa.email_verification_code_description',
  [MfaFactor.PhoneVerificationCode]: 'mfa.phone_verification_code_description',
};

function FactorLabel({ type }: Props) {
  const showBetaTag =
    type === MfaFactor.EmailVerificationCode || type === MfaFactor.PhoneVerificationCode;

  return (
    <div className={styles.factorLabel}>
      <div className={styles.factorTitleWrapper}>
        <MfaFactorTitle
          type={type}
          tooltip={type === MfaFactor.WebAuthn && <WebAuthnTipContent />}
        />
        {showBetaTag && <BetaTag />}
      </div>
      <div className={styles.factorDescription}>
        <DynamicT forKey={factorDescriptionLabel[type]} />
      </div>
    </div>
  );
}

export default FactorLabel;
