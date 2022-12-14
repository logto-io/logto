import TermsOfUseComponent from '@/components/TermsOfUse';
import usePlatform from '@/hooks/use-platform';
import useTerms from '@/hooks/use-terms';

type Props = {
  className?: string;
};

const TermsOfUse = ({ className }: Props) => {
  const { termsAgreement, setTermsAgreement, termsOfUseUrl, termsOfUseIframeModalHandler } =
    useTerms();
  const { isMobile } = usePlatform();

  if (!termsOfUseUrl) {
    return null;
  }

  return (
    <TermsOfUseComponent
      className={className}
      name="termsAgreement"
      termsUrl={termsOfUseUrl}
      isChecked={termsAgreement}
      onChange={(checked) => {
        setTermsAgreement(checked);
      }}
      onTermsClick={isMobile ? termsOfUseIframeModalHandler : undefined}
    />
  );
};

export default TermsOfUse;
