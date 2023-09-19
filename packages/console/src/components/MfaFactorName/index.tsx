import { type AdminConsoleKey } from '@logto/phrases';
import { MfaFactor } from '@logto/schemas';

import DynamicT from '@/ds-components/DynamicT';

const factorNameLabel: Record<MfaFactor, AdminConsoleKey> = {
  [MfaFactor.TOTP]: 'mfa.totp',
  [MfaFactor.WebAuthn]: 'mfa.webauthn',
  [MfaFactor.BackupCode]: 'mfa.backup_code',
};

export type Props = {
  type: MfaFactor;
  agent?: string;
};

function MfaFactorName({ type, agent }: Props) {
  return (
    <>
      <DynamicT forKey={factorNameLabel[type]} />
      {agent && ` - ${agent}`}
    </>
  );
}

export default MfaFactorName;
