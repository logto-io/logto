import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import TermsLinks from '@/components/TermsLinks';
import type { ModalContentRenderProps } from '@/hooks/use-confirm-modal';

const TermsAndPrivacyConfirmModalContent = ({ cancel }: ModalContentRenderProps) => {
  const { experienceSettings } = useContext(PageContext);
  const { termsOfUseUrl, privacyPolicyUrl } = experienceSettings ?? {};

  const { t } = useTranslation();

  return (
    <Trans
      components={{
        link: (
          <TermsLinks
            inline
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
