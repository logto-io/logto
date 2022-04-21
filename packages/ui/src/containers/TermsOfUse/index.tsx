import React from 'react';

import PureTermsOfUse from '@/components/TermsOfUse';
import TermsOfUseModal from '@/components/TermsOfUseModal';
import useTerms from '@/hooks/use-terms';

type Props = {
  className?: string;
};

const TermsOfUse = ({ className }: Props) => {
  const { termsAgreement, setTermsAgreement, termsSettings, showTermsModal, setShowTermsModal } =
    useTerms();

  if (!termsSettings?.enabled || !termsSettings.contentUrl) {
    return null;
  }

  console.log(termsSettings);

  return (
    <>
      <PureTermsOfUse
        className={className}
        name="termsAgreement"
        termsUrl={termsSettings.contentUrl}
        isChecked={termsAgreement}
        onChange={(checked) => {
          setTermsAgreement(checked);
        }}
      />
      <TermsOfUseModal
        isOpen={showTermsModal}
        termsUrl={termsSettings.contentUrl}
        onConfirm={() => {
          setTermsAgreement(true);
          setShowTermsModal(false);
        }}
        onClose={() => {
          setShowTermsModal(false);
        }}
      />
    </>
  );
};

export default TermsOfUse;
