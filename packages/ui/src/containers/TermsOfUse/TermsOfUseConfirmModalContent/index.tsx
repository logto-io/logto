import { useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import TextLink from '@/components/TextLink';
import type { Props as TextLinkProps } from '@/components/TextLink';
import type { ModalContentRenderProps } from '@/hooks/use-confirm-modal';
import { PageContext } from '@/hooks/use-page-context';
import usePlatform from '@/hooks/use-platform';
import { ConfirmModalMessage } from '@/types';

const TermsOfUseConfirmModalContent = ({ cancel }: ModalContentRenderProps) => {
  const { experienceSettings } = useContext(PageContext);
  const { termsOfUseUrl } = experienceSettings ?? {};

  const { t } = useTranslation();
  const { isMobile } = usePlatform();

  const linkProps: TextLinkProps = isMobile
    ? {
        onClick: () => {
          cancel(ConfirmModalMessage.SHOW_TERMS_DETAIL_MODAL);
        },
      }
    : {
        href: termsOfUseUrl ?? undefined,
        target: '_blank',
      };

  return (
    <Trans
      components={{
        link: (
          <TextLink
            key={t('description.terms_of_use')}
            text="description.terms_of_use"
            {...linkProps}
          />
        ),
      }}
    >
      {t('description.agree_with_terms_modal')}
    </Trans>
  );
};

export default TermsOfUseConfirmModalContent;
