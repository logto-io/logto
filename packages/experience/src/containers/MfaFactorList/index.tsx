import { MfaFactor } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import MfaFactorButton from '@/components/Button/MfaFactorButton';
import useStartTotpBinding from '@/hooks/use-start-totp-binding';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';

import * as styles from './index.module.scss';

type Props = {
  flow: UserMfaFlow;
  flowState: MfaFlowState;
};

const MfaFactorList = ({ flow, flowState }: Props) => {
  const startTotpBinding = useStartTotpBinding();
  const navigate = useNavigate();
  const { availableFactors } = flowState;

  const handleSelectFactor = useCallback(
    (factor: MfaFactor) => {
      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        void startTotpBinding(flowState);
        return;
      }

      navigate(`/${flow}/${factor}`, { state: flowState });
    },
    [flow, flowState, navigate, startTotpBinding]
  );

  return (
    <div className={styles.factorList}>
      {availableFactors.map((factor) => (
        <MfaFactorButton
          key={factor}
          factor={factor}
          isBinding={flow === UserMfaFlow.MfaBinding}
          onClick={() => {
            handleSelectFactor(factor);
          }}
        />
      ))}
    </div>
  );
};

export default MfaFactorList;
