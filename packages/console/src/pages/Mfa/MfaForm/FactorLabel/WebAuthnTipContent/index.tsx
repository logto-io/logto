import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

function WebAuthnTipContent() {
  return (
    <ul className={styles.webauthnTipContent}>
      <li>
        <DynamicT forKey="mfa.webauthn_native_tip" />
      </li>
      <li>
        <DynamicT forKey="mfa.webauthn_domain_tip" />
      </li>
    </ul>
  );
}

export default WebAuthnTipContent;
