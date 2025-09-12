import { conditional } from '@silverhand/essentials';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import MfaFactorList from '@/containers/MfaFactorList';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useSkipMfa from '@/hooks/use-skip-mfa';
import useSkipOptionalMfa from '@/hooks/use-skip-optional-mfa';
import { UserMfaFlow } from '@/types';

import ErrorPage from '../ErrorPage';

const MfaBinding = () => {
  const flowState = useMfaFlowState();
  const skipMfa = useSkipMfa();
  const skipOptionalMfa = useSkipOptionalMfa();

  if (!flowState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout
      title={flowState.suggestion ? 'mfa.add_another_mfa_factor' : 'mfa.add_mfa_factors'}
      description={
        flowState.suggestion ? 'mfa.add_another_mfa_description' : 'mfa.add_mfa_description'
      }
      onSkip={conditional(
        flowState.skippable && (flowState.suggestion ? skipOptionalMfa : skipMfa)
      )}
    >
      <MfaFactorList flow={UserMfaFlow.MfaBinding} flowState={flowState} />
    </SecondaryPageLayout>
  );
};

export default MfaBinding;
