import { MfaFactor } from '@logto/schemas';
import { type ReactNode } from 'react';

import FactorBackupCode from '@/assets/icons/factor-backup-code.svg';
import FactorTotp from '@/assets/icons/factor-totp.svg';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg';
import Tip from '@/assets/icons/tip.svg';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';

import MfaFactorName, { type Props as MfaFactorNameProps } from '../MfaFactorName';

import * as styles from './index.module.scss';

const factorIcon: Record<MfaFactor, SvgComponent> = {
  [MfaFactor.TOTP]: FactorTotp,
  [MfaFactor.WebAuthn]: FactorWebAuthn,
  [MfaFactor.BackupCode]: FactorBackupCode,
};

type Props = MfaFactorNameProps & {
  readonly tooltip?: ReactNode;
};

function MfaFactorTitle({ type, tooltip }: Props) {
  const Icon = factorIcon[type];

  return (
    <div className={styles.factorTitle}>
      <Icon className={styles.factorIcon} />
      <MfaFactorName type={type} />
      {tooltip && (
        <ToggleTip anchorClassName={styles.factorTip} content={tooltip}>
          <IconButton size="small">
            <Tip />
          </IconButton>
        </ToggleTip>
      )}
    </div>
  );
}

export default MfaFactorTitle;
