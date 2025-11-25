import { MfaFactor, SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';

import MfaFactorButton from '@/components/Button/MfaFactorButton';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSendMfaVerificationCode from '@/hooks/use-send-mfa-verification-code';
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
  const navigate = useNavigateWithPreservedSearchParams();
  const { availableFactors } = flowState;
  const { onSubmit: sendMfaVerificationCode } = useSendMfaVerificationCode();

  const handleSelectFactor = useCallback(
    async (factor: MfaFactor) => {
      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        return startTotpBinding(flowState);
      }

      if (factor === MfaFactor.WebAuthn) {
        return startWebAuthnProcessing(flow, flowState);
      }

      if (factor === MfaFactor.EmailVerificationCode && flow === UserMfaFlow.MfaVerification) {
        await sendMfaVerificationCode(SignInIdentifier.Email, flowState);
        return;
      }

      if (factor === MfaFactor.PhoneVerificationCode && flow === UserMfaFlow.MfaVerification) {
        await sendMfaVerificationCode(SignInIdentifier.Phone, flowState);
        return;
      }

      navigate(`/${flow}/${factor}`, { state: flowState });
    },
    [flow, flowState, navigate, sendMfaVerificationCode, startTotpBinding, startWebAuthnProcessing]
  );

  return (
    <div className={styles.factorList}>
      {availableFactors.map((factor) => {
        const isEmailOrPhone =
          factor === MfaFactor.EmailVerificationCode || factor === MfaFactor.PhoneVerificationCode;
        const isDisabled = Boolean(
          flowState.suggestion && isEmailOrPhone && flowState.maskedIdentifiers?.[factor]
        );
        const maskedIdentifier = isEmailOrPhone ? flowState.maskedIdentifiers?.[factor] : undefined;

        return (
          <MfaFactorButton
            key={factor}
            factor={factor}
            isBinding={flow === UserMfaFlow.MfaBinding}
            isDisabled={isDisabled}
            maskedIdentifier={maskedIdentifier}
            onClick={async () => {
              await handleSelectFactor(factor);
            }}
          />
        );
      })}
    </div>
  );
};

export default MfaFactorList;
