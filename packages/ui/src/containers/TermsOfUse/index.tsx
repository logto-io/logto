import React from 'react';
import ModalContainer from 'react-modal-promise';

import TermsOfUseComponent from '@/components/TermsOfUse';
import useTerms from '@/hooks/use-terms';

type Props = {
  className?: string;
};

const TermsOfUse = ({ className }: Props) => {
  const { termsAgreement, setTermsAgreement, termsSettings } = useTerms();

  if (!termsSettings?.enabled || !termsSettings.contentUrl) {
    return null;
  }

  return (
    <>
      <TermsOfUseComponent
        className={className}
        name="termsAgreement"
        termsUrl={termsSettings.contentUrl}
        isChecked={termsAgreement}
        onChange={(checked) => {
          setTermsAgreement(checked);
        }}
      />
      <ModalContainer />
    </>
  );
};

export default TermsOfUse;
