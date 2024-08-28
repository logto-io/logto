import { MfaFactor } from '@logto/schemas';
import classNames from 'classnames';
import { type TFuncKey } from 'i18next';

import ArrowNext from '@/assets/icons/arrow-next.svg';
import FactorBackupCode from '@/assets/icons/factor-backup-code.svg';
import FactorTotp from '@/assets/icons/factor-totp.svg';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg';

import DynamicT from '../DynamicT';

import * as mfaFactorButtonStyles from './MfaFactorButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  readonly factor: MfaFactor;
  readonly isBinding: boolean;
  readonly onClick?: () => void;
};

const factorIcon: Record<MfaFactor, SvgComponent> = {
  [MfaFactor.TOTP]: FactorTotp,
  [MfaFactor.WebAuthn]: FactorWebAuthn,
  [MfaFactor.BackupCode]: FactorBackupCode,
};

const factorName: Record<MfaFactor, TFuncKey> = {
  [MfaFactor.TOTP]: 'mfa.totp',
  [MfaFactor.WebAuthn]: 'mfa.webauthn',
  [MfaFactor.BackupCode]: 'mfa.backup_code',
};

const factorDescription: Record<MfaFactor, TFuncKey> = {
  [MfaFactor.TOTP]: 'mfa.verify_totp_description',
  [MfaFactor.WebAuthn]: 'mfa.verify_webauthn_description',
  [MfaFactor.BackupCode]: 'mfa.verify_backup_code_description',
};

const linkFactorDescription: Record<MfaFactor, TFuncKey> = {
  [MfaFactor.TOTP]: 'mfa.link_totp_description',
  [MfaFactor.WebAuthn]: 'mfa.link_webauthn_description',
  [MfaFactor.BackupCode]: 'mfa.link_backup_code_description',
};

const MfaFactorButton = ({ factor, isBinding, onClick }: Props) => {
  const Icon = factorIcon[factor];

  return (
    <button
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        mfaFactorButtonStyles.mfaFactorButton
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className={mfaFactorButtonStyles.icon} />
      <div className={mfaFactorButtonStyles.title}>
        <div className={mfaFactorButtonStyles.name}>
          <DynamicT forKey={factorName[factor]} />
        </div>
        <div className={mfaFactorButtonStyles.description}>
          <DynamicT forKey={(isBinding ? linkFactorDescription : factorDescription)[factor]} />
        </div>
      </div>
      <ArrowNext className={mfaFactorButtonStyles.icon} />
    </button>
  );
};

export default MfaFactorButton;
