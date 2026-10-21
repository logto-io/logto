import { VerificationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import Divider from '@/components/Divider';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useSkipOptionalMfa from '@/hooks/use-skip-optional-mfa';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';
import { totpBindingStateGuard } from '@/types/guard';

import MfaBinding from '..';

import SecretSection from './SecretSection';
import VerificationSection from './VerificationSection';
import styles from './index.module.scss';

const TotpBinding = () => {
  const { state } = useLocation();
  const [, totpBindingState] = validate(state, totpBindingStateGuard);
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.TOTP];

  const skipMfa = useSkipMfa();
  const skipOptionalMfa = useSkipOptionalMfa();
  const flowState = useMfaFlowState(UserMfaFlow.MfaBinding);

  if (!totpBindingState || !verificationId) {
    // Secrets are not part of the sanitized context; restart binding from the offered factors.
    return flowState?.isStepUp ? <MfaBinding /> : <ErrorPage title="error.invalid_session" />;
  }

  const { secret: _secret, secretQrCode: _secretQrCode, ...mfaFlowState } = totpBindingState;
  const { availableFactors, skippable, suggestion } = flowState ?? mfaFlowState;

  return (
    <SecondaryPageLayout
      title="mfa.add_authenticator_app"
      onSkip={conditional(skippable && (suggestion ? skipOptionalMfa : skipMfa))}
    >
      <div className={styles.container}>
        <SecretSection {...totpBindingState} />
        <Divider />
        <VerificationSection verificationId={verificationId} />
        {availableFactors.length > 1 && (
          <>
            <Divider />
            <SwitchMfaFactorsLink
              flow={UserMfaFlow.MfaBinding}
              flowState={flowState ?? mfaFlowState}
              className={styles.switchLink}
            />
          </>
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default TotpBinding;
