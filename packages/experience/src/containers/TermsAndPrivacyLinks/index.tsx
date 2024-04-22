import TermsLinks from '@/components/TermsLinks';
import useTerms from '@/hooks/use-terms';

type Props = {
  readonly className?: string;
};

// For sign-in page displaying terms and privacy links use only. No user interaction is needed.
const TermsAndPrivacyLinks = ({ className }: Props) => {
  const { termsOfUseUrl, privacyPolicyUrl, isTermsDisabled } = useTerms();

  if (isTermsDisabled) {
    return null;
  }

  return (
    <div className={className}>
      <TermsLinks termsOfUseUrl={termsOfUseUrl} privacyPolicyUrl={privacyPolicyUrl} />
    </div>
  );
};

export default TermsAndPrivacyLinks;
