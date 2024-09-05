import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import TermsLinks from '@/components/TermsLinks';

// Used by useTerms hook to display the terms and privacy policy confirmation modal
// This component should be used as the ModalContent prop in the useConfirmModal hook
const TermsAndPrivacyConfirmModalContent = () => {
  const { experienceSettings } = useContext(PageContext);
  const { termsOfUseUrl, privacyPolicyUrl } = experienceSettings ?? {};

  const { t } = useTranslation();

  return (
    <Trans
      components={{
        link: (
          <TermsLinks
            inline
            linkType="primary"
            termsOfUseUrl={conditional(termsOfUseUrl)}
            privacyPolicyUrl={conditional(privacyPolicyUrl)}
          />
        ),
      }}
    >
      {t('description.agree_with_terms_modal')}
    </Trans>
  );
};

export default TermsAndPrivacyConfirmModalContent;
