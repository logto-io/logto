import { type AdminConsoleKey } from '@logto/phrases';
import { MfaFactor } from '@logto/schemas';
import { useMemo } from 'react';
import { UAParser as parseUa } from 'ua-parser-js';

import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';

const factorNameLabel: Record<MfaFactor, AdminConsoleKey> = {
  [MfaFactor.TOTP]: 'mfa.totp',
  [MfaFactor.WebAuthn]: 'mfa.webauthn',
  [MfaFactor.BackupCode]: 'mfa.backup_code',
  [MfaFactor.EmailVerificationCode]: 'mfa.email_verification_code',
  [MfaFactor.PhoneVerificationCode]: 'mfa.phone_verification_code',
};

export type Props = {
  readonly type: MfaFactor;
  readonly agent?: string;
  readonly name?: string;
};

function MfaFactorName({ type, agent, name }: Props) {
  const passKeyName = useMemo(() => {
    if (type !== MfaFactor.WebAuthn) {
      return null;
    }

    if (name) {
      return name;
    }

    if (!agent) {
      return null;
    }

    const { browser, os } = parseUa(agent);

    return `${browser.name} on ${os.name}`;
  }, [type, name, agent]);

  if (passKeyName) {
    return (
      <div>
        <DynamicT forKey={factorNameLabel[type]} />
        <div className={styles.description}>{passKeyName}</div>
      </div>
    );
  }

  return <DynamicT forKey={factorNameLabel[type]} />;
}

export default MfaFactorName;
