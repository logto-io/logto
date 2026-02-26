import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSkipMfa from '@/hooks/use-skip-mfa';
import Button from '@/shared/components/Button';
import { UserMfaFlow } from '@/types';

const MfaOnboarding = () => {
  const flowState = useMfaFlowState();
  const skipMfa = useSkipMfa();
  const navigate = useNavigateWithPreservedSearchParams();

  return (
    <SecondaryPageLayout
      title="mfa.onboarding"
      description="mfa.onboarding_description"
      onSkip={skipMfa}
    >
      <Button
        type="primary"
        title="mfa.enable_mfa"
        onClick={() => {
          navigate({ pathname: `/${UserMfaFlow.MfaBinding}` }, { state: flowState });
        }}
      />
    </SecondaryPageLayout>
  );
};

export default MfaOnboarding;
