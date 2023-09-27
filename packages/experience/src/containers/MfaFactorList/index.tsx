import { MfaFactor } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import MfaFactorButton from '@/components/Button/MfaFactorButton';
import useStartTotpBinding from '@/hooks/use-start-binding-totp';
import { UserMfaFlow } from '@/types';
import { type TotpVerificationState } from '@/types/guard';

import * as styles from './index.module.scss';

type Props = {
  flow: UserMfaFlow;
  factors: MfaFactor[];
};

const MfaFactorList = ({ flow, factors }: Props) => {
  const startTotpBinding = useStartTotpBinding();
  const navigate = useNavigate();

  const handleSelectFactor = useCallback(
    async (factor: MfaFactor) => {
      if (factor === MfaFactor.TOTP) {
        if (flow === UserMfaFlow.MfaBinding) {
          await startTotpBinding(factors.length > 1);
        }

        if (flow === UserMfaFlow.MfaVerification) {
          const state: TotpVerificationState = { allowOtherFactors: true };
          navigate(`/${UserMfaFlow.MfaVerification}/${factor}`, { state });
        }
      }
      // Todo @xiaoyijun implement other factors
    },
    [factors.length, flow, navigate, startTotpBinding]
  );

  return (
    <div className={styles.factorList}>
      {factors.map((factor) => (
        <MfaFactorButton
          key={factor}
          factor={factor}
          isBinding={flow === UserMfaFlow.MfaBinding}
          onClick={() => {
            void handleSelectFactor(factor);
          }}
        />
      ))}
    </div>
  );
};

export default MfaFactorList;
