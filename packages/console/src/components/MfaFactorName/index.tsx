import { type AdminConsoleKey } from '@logto/phrases';
import { MfaFactor } from '@logto/schemas';

import DynamicT from '@/ds-components/DynamicT';

const factorNameLabel: Record<MfaFactor, AdminConsoleKey> = {
  [MfaFactor.TOTP]: 'mfa.totp',
  [MfaFactor.WebAuthn]: 'mfa.webauthn',
  [MfaFactor.BackupCode]: 'mfa.backup_code',
};

export type Props = {
  readonly type: MfaFactor;
};

function MfaFactorName({ type }: Props) {
  return <DynamicT forKey={factorNameLabel[type]} />;
}

export default MfaFactorName;
