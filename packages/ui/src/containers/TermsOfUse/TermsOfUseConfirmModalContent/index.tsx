import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import TermsLinks from '@/components/TermsLinks';
import type { ModalContentRenderProps } from '@/hooks/use-confirm-modal';
import { PageContext } from '@/hooks/use-page-context';

const TermsOfUseConfirmModalContent = ({ cancel }: ModalContentRenderProps) => {
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

export default TermsOfUseConfirmModalContent;
