import { VerificationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useSkipOptionalMfa from '@/hooks/use-skip-optional-mfa';
import useWebAuthnOperation from '@/hooks/use-webauthn-operation';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import { UserMfaFlow } from '@/types';
import { webAuthnStateGuard } from '@/types/guard';
import { isWebAuthnOptions } from '@/utils/webauthn';

import MfaBinding from '..';

import styles from './index.module.scss';

const WebAuthnBinding = () => {
  const { state } = useLocation();
  const [, webAuthnState] = validate(state, webAuthnStateGuard);
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.WebAuthn];
  const handleWebAuthn = useWebAuthnOperation(UserMfaFlow.MfaBinding);
  const skipMfa = useSkipMfa();
  const skipOptionalMfa = useSkipOptionalMfa();
  const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);
  const flowState = useMfaFlowState(UserMfaFlow.MfaBinding);

  if (!webAuthnState || !verificationId) {
    return flowState?.isStepUp ? <MfaBinding /> : <ErrorPage title="error.invalid_session" />;
  }

  const { options, ...mfaFlowState } = webAuthnState;
  const { skippable, suggestion } = flowState ?? mfaFlowState;

  if (!isWebAuthnOptions(options)) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout
      title="mfa.create_a_passkey"
      description="mfa.create_passkey_description"
      onSkip={conditional(skippable && (suggestion ? skipOptionalMfa : skipMfa))}
    >
      <Button
        title="mfa.create_a_passkey"
        isLoading={isCreatingPasskey}
        onClick={async () => {
          setIsCreatingPasskey(true);
          await handleWebAuthn(options, verificationId);
          setIsCreatingPasskey(false);
        }}
      />
      <SwitchMfaFactorsLink
        flow={UserMfaFlow.MfaBinding}
        flowState={flowState ?? mfaFlowState}
        className={styles.switchLink}
      />
    </SecondaryPageLayout>
  );
};

export default WebAuthnBinding;
