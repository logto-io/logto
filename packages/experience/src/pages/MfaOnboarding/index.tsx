import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import useEnableMfa from '@/hooks/use-enable-mfa';
import useSkipMfa from '@/hooks/use-skip-mfa';
import Button from '@/shared/components/Button';

const MfaOnboarding = () => {
  const skipMfa = useSkipMfa();
  const enableMfa = useEnableMfa();

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
