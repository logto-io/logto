import { MfaFactor } from '@logto/schemas';

import FactorBackupCode from '@/assets/icons/factor-backup-code.svg';
import FactorTotp from '@/assets/icons/factor-totp.svg';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg';

import MfaFactorName, { type Props as MfaFactorNameProps } from '../MfaFactorName';

import * as styles from './index.module.scss';

const factorIcon: Record<MfaFactor, SvgComponent> = {
  [MfaFactor.TOTP]: FactorTotp,
  [MfaFactor.WebAuthn]: FactorWebAuthn,
  [MfaFactor.BackupCode]: FactorBackupCode,
};

function MfaFactorTitle({ type }: MfaFactorNameProps) {
  const Icon = factorIcon[type];

  return (
    <div className={styles.factorTitle}>
      <Icon className={styles.factorIcon} />
      <MfaFactorName type={type} />
    </div>
  );
}

export default MfaFactorTitle;
