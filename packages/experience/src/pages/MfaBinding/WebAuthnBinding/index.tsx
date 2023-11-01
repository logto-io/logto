import { conditional } from '@silverhand/essentials';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { webAuthnStateGuard } from '@/types/guard';
import { isWebAuthnOptions } from '@/utils/webauthn';

import * as styles from './index.module.scss';

const WebAuthnBinding = () => {
  const { state } = useLocation();
  const [, webAuthnState] = validate(state, webAuthnStateGuard);
  const handleWebAuthn = useWebAuthnOperation();
  const skipMfa = useSkipMfa();

  if (!webAuthnState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { options, availableFactors, skippable } = webAuthnState;

  if (!isWebAuthnOptions(options)) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout
      title="mfa.create_a_passkey"
      description="mfa.create_passkey_description"
      onSkip={conditional(skippable && skipMfa)}
    >
      <Button
        title="mfa.create_a_passkey"
        onClick={() => {
          void handleWebAuthn(options);
        }}
      />
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaBinding}
        flowState={{ availableFactors, skippable }}
        className={styles.switchLink}
      />
    </SecondaryPageLayout>
  );
};

export default WebAuthnBinding;
