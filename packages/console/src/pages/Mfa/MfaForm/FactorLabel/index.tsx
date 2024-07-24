import { type AdminConsoleKey } from '@logto/phrases';
import { MfaFactor } from '@logto/schemas';

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
};

function FactorLabel({ type }: Props) {
  return (
    <div className={styles.factorLabel}>
      <MfaFactorTitle type={type} tooltip={type === MfaFactor.WebAuthn && <WebAuthnTipContent />} />
      <div className={styles.factorDescription}>
        <DynamicT forKey={factorDescriptionLabel[type]} />
      </div>
    </div>
  );
}

export default FactorLabel;
