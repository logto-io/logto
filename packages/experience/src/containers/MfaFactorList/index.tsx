import { MfaFactor } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import MfaFactorButton from '@/components/Button/MfaFactorButton';
import useStartTotpBinding from '@/hooks/use-start-totp-binding';
import useStartWebAuthnProcessing from '@/hooks/use-start-webauthn-processing';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';

import styles from './index.module.scss';

type Props = {
  readonly flow: UserMfaFlow;
  readonly flowState: MfaFlowState;
};

const MfaFactorList = ({ flow, flowState }: Props) => {
  const startTotpBinding = useStartTotpBinding();
  const startWebAuthnProcessing = useStartWebAuthnProcessing();
  const navigate = useNavigate();
  const { availableFactors } = flowState;

  const handleSelectFactor = useCallback(
    async (factor: MfaFactor) => {
      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        return startTotpBinding(flowState);
      }

      if (factor === MfaFactor.WebAuthn) {
        return startWebAuthnProcessing(flow, flowState);
      }

      if (factor === MfaFactor.EmailVerificationCode && flow === UserMfaFlow.MfaBinding) {
        navigate(`/${flow}/${factor}`, { state: flowState });
        return;
      }

      if (factor === MfaFactor.PhoneVerificationCode && flow === UserMfaFlow.MfaBinding) {
        navigate(`/${flow}/${factor}`, { state: flowState });
        return;
      }

      navigate(`/${flow}/${factor}`, { state: flowState });
    },
    [flow, flowState, navigate, startTotpBinding, startWebAuthnProcessing]
  );

  return (
    <div className={styles.factorList}>
      {availableFactors.map((factor) => (
        <MfaFactorButton
          key={factor}
          factor={factor}
          isBinding={flow === UserMfaFlow.MfaBinding}
          onClick={async () => {
            await handleSelectFactor(factor);
          }}
        />
      ))}
    </div>
  );
};

export default MfaFactorList;
