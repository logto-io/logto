import { MfaFactor } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import MfaFactorButton from '@/components/Button/MfaFactorButton';
import useStartTotpBinding from '@/hooks/use-start-totp-binding';
import { UserMfaFlow } from '@/types';
import { type MfaFactorsState } from '@/types/guard';

import * as styles from './index.module.scss';

type Props = {
  flow: UserMfaFlow;
  factors: MfaFactor[];
};

const MfaFactorList = ({ flow, factors }: Props) => {
  const startTotpBinding = useStartTotpBinding();
  const navigate = useNavigate();

  const handleSelectFactor = useCallback(
    (factor: MfaFactor) => {
      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        void startTotpBinding(factors);
        return;
      }

      navigate(`/${flow}/${factor}`, {
        state: { availableFactors: factors } satisfies MfaFactorsState,
      });
    },
    [factors, flow, navigate, startTotpBinding]
  );

  return (
    <div className={styles.factorList}>
      {factors.map((factor) => (
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
