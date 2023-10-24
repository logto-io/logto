import { conditional } from '@silverhand/essentials';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';

const WebAuthnBinding = () => {
  const flowState = useMfaFlowState();
  const bindWebAuthn = useWebAuthnOperation(UserMfaFlow.MfaBinding);
  const skipMfa = useSkipMfa();

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { skippable } = flowState;

  return (
    <SecondaryPageLayout
      title="mfa.create_a_passkey"
      description="mfa.create_passkey_description"
      onSkip={conditional(skippable && skipMfa)}
    >
      <Button title="mfa.create_a_passkey" onClick={bindWebAuthn} />
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaBinding}
        flowState={flowState}
        className={styles.switchLink}
      />
    </SecondaryPageLayout>
  );
};

export default WebAuthnBinding;
