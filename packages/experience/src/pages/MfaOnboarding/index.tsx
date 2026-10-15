import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import useEnableMfa from '@/hooks/use-enable-mfa';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useSkipMfa from '@/hooks/use-skip-mfa';
import MfaBinding from '@/pages/MfaBinding';
import Button from '@/shared/components/Button';
import { UserMfaFlow } from '@/types';

const MfaOnboarding = () => {
  const skipMfa = useSkipMfa();
  const enableMfa = useEnableMfa();
  const flowState = useMfaFlowState(UserMfaFlow.MfaBinding);

  if (flowState?.isStepUp) {
    return <MfaBinding />;
  }

  return (
    <SecondaryPageLayout
      title="mfa.onboarding"
      description="mfa.onboarding_description"
      onSkip={skipMfa}
    >
      <Button type="primary" title="mfa.enable_mfa" onClick={enableMfa} />
    </SecondaryPageLayout>
  );
};

export default MfaOnboarding;
