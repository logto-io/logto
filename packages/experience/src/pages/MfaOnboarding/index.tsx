import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import useEnableMfa from '@/hooks/use-enable-mfa';
import useShouldHideMfaBackNavigation from '@/hooks/use-should-hide-mfa-back-navigation';
import useSkipMfa from '@/hooks/use-skip-mfa';
import Button from '@/shared/components/Button';

const MfaOnboarding = () => {
  const skipMfa = useSkipMfa();
  const enableMfa = useEnableMfa();
  const shouldHideBack = useShouldHideMfaBackNavigation();

  return (
    <SecondaryPageLayout
      isBackHidden={shouldHideBack}
      title="mfa.onboarding"
      description="mfa.onboarding_description"
      onSkip={skipMfa}
    >
      <Button type="primary" title="mfa.enable_mfa" onClick={enableMfa} />
    </SecondaryPageLayout>
  );
};

export default MfaOnboarding;
